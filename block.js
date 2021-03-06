const util = require('./util')

module.exports = chemicalBlock

const lineFeed = 10 //  '\n'
const space = 32 // ' '
const dollarSign = 38 // '&'

const lineFeedChar = '\n'
const dollarSignChar = '&'

const minFenceCount = 2

const classList = ['chemical', 'chemical-display']

function chemicalBlock() {
	const parser = this.Parser
	const compiler = this.Compiler

	if (util.isRemarkParser(parser)) {
		attachParser(parser)
	}

	if (util.isRemarkCompiler(compiler)) {
		attachCompiler(compiler)
	}
}

function attachParser(parser) {
	const proto = parser.prototype
	const blockMethods = proto.blockMethods
	const interruptParagraph = proto.interruptParagraph
	const interruptList = proto.interruptList
	const interruptBlockquote = proto.interruptBlockquote

	proto.blockTokenizers.chemical = chemicalBlockTokenizer

	blockMethods.splice(
		blockMethods.indexOf('fencedCode') + 1,
		0,
		'chemical'
	)

	// Inject chemical to interrupt rules
	interruptParagraph.splice(
		interruptParagraph.indexOf('fencedCode') + 1,
		0,
		['chemical']
	)
	interruptList.splice(
		interruptList.indexOf('fencedCode') + 1,
		0,
		['chemical']
	)
	interruptBlockquote.splice(
		interruptBlockquote.indexOf('fencedCode') + 1,
		0,
		['chemical']
	)

	function chemicalBlockTokenizer(eat, value, silent) {
		var length = value.length
		var index = 0
		let code
		let content
		let lineEnd
		let lineIndex
		let openingFenceIndentSize
		let openingFenceSize
		let openingFenceContentStart
		let closingFence
		let closingFenceSize
		let lineContentStart
		let lineContentEnd

		/*
		console.log('-----START-----')
		console.log(JSON.stringify(value))
*/

		// Skip initial spacing.
		while (
			index < length &&
			value.charCodeAt(index) === space
		) {
			index++
		}

		openingFenceIndentSize = index

		// Skip the fence.
		while (
			index < length &&
			value.charCodeAt(index) === dollarSign
		) {
			index++
		}

		openingFenceSize = index - openingFenceIndentSize

		//console.log(index, openingFenceSize)

		// Exit if there is not enough of a fence.
		if (openingFenceSize < minFenceCount) {
			return
		}

		// Skip spacing after the fence.
		while (
			index < length &&
			value.charCodeAt(index) === space
		) {
			index++
		}

		openingFenceContentStart = index

		/*console.log(
			'openingFenceContentStart',
			openingFenceContentStart
		)*/

		/*
		value =
			value.slice(0, openingFenceContentStart) +
			'\n' +
			value.slice(openingFenceContentStart)
		length++

		// Eat everything after the fence.
		while (index < length) {
			code = value.charCodeAt(index)
			console.log('code', code)

			// We don’t allow dollar signs here, as that could interfere with inline
			// chemical.
			if (code === dollarSign) {
				return
			}

			if (code === lineFeed) {
				break
			}

			index++
		}

		if (value.charCodeAt(index) !== lineFeed) {
			return
		}

		if (silent) {
			return true
		}*/

		content = []

		if (openingFenceContentStart !== index) {
			content.push(
				value.slice(openingFenceContentStart, index)
			)
		}

		//index++
		lineEnd = value.indexOf(lineFeedChar, index + 1)
		lineEnd = lineEnd === -1 ? length : lineEnd

		while (index < length) {
			closingFence = false
			lineContentStart = index
			lineContentEnd = lineEnd
			lineIndex = lineEnd
			closingFenceSize = 0

			// First, let’s see if this is a valid closing fence.
			// Skip trailing white space
			while (
				lineIndex > lineContentStart &&
				value.charCodeAt(lineIndex - 1) === space
			) {
				lineIndex--
			}

			// Skip the fence.
			while (
				lineIndex > lineContentStart &&
				value.charCodeAt(lineIndex - 1) === dollarSign
			) {
				closingFenceSize++
				lineIndex--
			}

			// Check if this is a valid closing fence line.
			if (
				openingFenceSize <= closingFenceSize &&
				value.indexOf(dollarSignChar, lineContentStart) ===
					lineIndex
			) {
				closingFence = true
				lineContentEnd = lineIndex
			}

			// Sweet, next, we need to trim the line.
			// Skip initial spacing.
			while (
				lineContentStart <= lineContentEnd &&
				lineContentStart - index < openingFenceIndentSize &&
				value.charCodeAt(lineContentStart) === space
			) {
				lineContentStart++
			}

			// If this is a closing fence, skip final spacing.
			if (closingFence) {
				while (
					lineContentEnd > lineContentStart &&
					value.charCodeAt(lineContentEnd - 1) === space
				) {
					lineContentEnd--
				}
			}

			// If this is a content line, or if there is content before the fence:
			if (
				!closingFence ||
				lineContentStart !== lineContentEnd
			) {
				content.push(
					value.slice(lineContentStart, lineContentEnd)
				)
			}

			if (closingFence) {
				break
			}

			index = lineEnd + 1
			lineEnd = value.indexOf(lineFeedChar, index + 1)
			lineEnd = lineEnd === -1 ? length : lineEnd
		}

		content = content.join('\n')

		//console.log('content', content)

		return eat(value.slice(0, lineEnd))({
			type: 'chemical',
			value: content,
			data: {
				hName: 'div',
				hProperties: { className: classList.concat() },
				hChildren: [{ type: 'text', value: content }],
			},
		})
	}
}

function attachCompiler(compiler) {
	const proto = compiler.prototype

	proto.visitors.chemical = compileBlockChemical

	function compileBlockChemical(node) {
		console.log('node', node)
		return '&&\n' + node.value + '\n&&'
	}
}

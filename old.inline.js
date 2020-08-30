const util = require('./util')

module.exports = chemicalInline

const tab = 9 // '\t'
const space = 32 // ' '
const dollarSign = 38 // '&'
const digit0 = 48 // '0'
const digit9 = 57 // '9'
const backslash = 92 // '\\'

const minFenceCount = 2

const classList = ['chemical', 'chemical-inline']
const chemicalDisplay = 'chemical-display'

function chemicalInline(options) {
	const parser = this.Parser
	const compiler = this.Compiler

	if (util.isRemarkParser(parser)) {
		attachParser(parser, options)
	}

	if (util.isRemarkCompiler(compiler)) {
		attachCompiler(compiler, options)
	}
}

function attachParser(parser, options) {
	const proto = parser.prototype
	const inlineMethods = proto.inlineMethods

	chemicalInlineTokenizer.locator = locator

	proto.inlineTokenizers.chemical = chemicalInlineTokenizer

	inlineMethods.splice(
		inlineMethods.indexOf('text'),
		0,
		'chemical'
	)

	function locator(value, fromIndex) {
		return value.indexOf(
			'&'.repeat(minFenceCount),
			fromIndex
		)
	}

	function chemicalInlineTokenizer(eat, value, silent) {
		const length = value.length
		let double = false
		let escaped = false
		let index = 0
		let previous
		let code
		let next
		let contentStart
		let contentEnd
		let valueEnd
		let content

		console.log('-----START----- silent : ', silent)
		console.log(JSON.stringify(value))

		if (value.charCodeAt(index) === backslash) {
			escaped = true
			index++
		}

		// Skip line start content.
		while (
			index < length &&
			value.charCodeAt(index) !== dollarSign
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

		console.log(index, openingFenceSize)

		// Exit if there is not enough of a fence.
		if (openingFenceSize < minFenceCount) {
			return
		}
		if (openingFenceSize == 2) double = true

		//there is text before
		if (
			index !== openingFenceSize ||
			(escaped && index !== openingFenceSize + 1)
		) {
			return
			/*
			const before = value.slice(
				0,
				index - openingFenceSize
			)

			console.log(
				'return text before : ',
				JSON.stringify(before)
			)
			return eat(before)({
				type: 'text',
				value: before,
			})*/
		} else if (silent) {
			return true
		}

		// Skip spacing after the fence.
		while (
			index < length &&
			value.charCodeAt(index) === space
		) {
			index++
		}

		openingFenceContentStart = index

		console.log(
			'openingFenceContentStart',
			openingFenceContentStart
		)

		/*
		 *
		 *
		if (value.charCodeAt(index) !== dollarSign) {
			return
		}

		index++
*/
		/*
		// Support escaped dollars.
		if (escaped) {
			// istanbul ignore if - never used (yet) 
			if (silent) {
				return true
			}

			return eat(value.slice(0, index))({
				type: 'text',
				value: '&',
			})
		}

		if (value.charCodeAt(index) === dollarSign) {
			double = true
			index++
		}
*/
		next = value.charCodeAt(index)

		// Opening fence cannot be followed by a space or a tab.
		if (next === space || next === tab) {
			return
		}

		contentStart = index

		while (index < length) {
			code = next
			next = value.charCodeAt(index + 1)

			if (code === dollarSign) {
				previous = value.charCodeAt(index - 1)

				// Closing fence cannot be preceded by a space or a tab, or followed by
				// a digit.
				// If a double marker was used to open, the closing fence must consist
				// of two dollars as well.
				if (
					previous !== space &&
					previous !== tab &&
					// eslint-disable-next-line no-self-compare
					(next !== next ||
						next < digit0 ||
						next > digit9) &&
					(!double || next === dollarSign)
				) {
					contentEnd = index - 1

					index++

					if (double) {
						index++
					}

					valueEnd = index
					break
				}
			} else if (code === backslash) {
				index++
				next = value.charCodeAt(index + 1)
			}

			index++
		}

		if (valueEnd === undefined) {
			return
		}

		/* istanbul ignore if - never used (yet) */
		if (silent) {
			return true
		}

		content = value.slice(contentStart, contentEnd + 1)

		console.log('inline content', content)

		return eat(value.slice(0, valueEnd))({
			type: 'inlineChemical',
			value: content,
			data: {
				hName: 'span',
				hProperties: {
					className: classList.concat(
						double && options.inlineChemicalDouble
							? [chemicalDisplay]
							: []
					),
				},
				hChildren: [{ type: 'text', value: content }],
			},
		})
	}
}

function attachCompiler(compiler) {
	const proto = compiler.prototype

	proto.visitors.inlineChemical = compileInlineChemical

	function compileInlineChemical(node) {
		let fence = '&'
		const classes =
			(node.data &&
				node.data.hProperties &&
				node.data.hProperties.className) ||
			[]

		if (classes.includes(chemicalDisplay)) {
			fence = '&&'
		}

		console.log('fence', node)

		return fence + node.value + fence
	}
}

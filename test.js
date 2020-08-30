var unified = require('unified')
var markdown = require('remark-parse')
var remarkMath = require('remark-math')
var rehypeKatex = require('rehype-katex')
var remark2rehype = require('remark-rehype')
var doc = require('rehype-document')
var format = require('rehype-format')
var html = require('rehype-stringify')
var report = require('vfile-reporter')

var smiles = require('./index.js')
var rehypeSmiles = require('../rehype-smiles')

unified()
	.use(markdown)
	.use(remark2rehype)
	.use(remarkMath)
	.use(rehypeKatex)
	.use(doc, { title: '👋🌍' })
	.use(format)
	.use(smiles)
	.use(rehypeSmiles)
	.use(html)
	.process(
		`before

# Hello world!

€€CCOC€€

texteeeee €€CCCCCC€€ afterrrrr

€CCC€
`,
		function (err, file) {
			console.error(report(err || file))
			//console.log(String(file))
		}
	)

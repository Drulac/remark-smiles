const inlinePlugin = require('./inline')
//const blockPlugin = require('./block')

module.exports = chemical

function chemical(options) {
	const settings = options || {}
	//blockPlugin.call(this, settings)
	inlinePlugin.call(this, settings)
}

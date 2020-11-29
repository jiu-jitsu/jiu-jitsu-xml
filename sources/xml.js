
/**
 * 
 */

const util = require("util")
const childProcess = require("child_process")

/**
 *
 */

module.exports = async (fileXml, fileJson) => {
	const command = `./xml2json ${fileXml} > ${fileJson}`
	const options = { cwd: __dirname }
	await util.promisify(childProcess.exec)(command, options)
}

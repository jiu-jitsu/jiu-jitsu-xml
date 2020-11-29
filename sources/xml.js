
/**
 * 
 */

const childProcess = require("child_process")

/**
 *
 */

module.exports = async (fileXml, fileJson) => {
	const command = `./xml2json ${fileXml} > ${fileJson}`
	const options = { cwd: __dirname }
	await new Promise((resolve) => childProcess.exec(command, options, resolve))
}

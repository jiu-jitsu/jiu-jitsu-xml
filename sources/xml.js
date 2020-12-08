
/**
 *
 */

const util = require("util")
const childProcess = require("child_process")

/**
 *
 */

async function xml (fileXml, fileJson) {
	const command = `./xml2json ${fileXml} > ${fileJson}`
	const options = { cwd: __dirname }
	await util.promisify(childProcess.exec)(command, options)
}

/**
 *
 */

module.exports = xml

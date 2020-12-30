
/**
 *
 */

const childProcess = require("child_process")

/**
 * @param {String} xmlText
 * @return {Object}
 */

async function xml (xmlText) {

	/**
	 *
	 */

	const buffers = []
	const xml2json = childProcess.spawn("./xml2json", { cwd: __dirname })

	/**
	 *
	 */

	xml2json.stdin.write(xmlText)
	xml2json.stdin.end()

	/**
	 *
	 */

	for await (const buffer of xml2json.stdout) {
		buffers.push(buffer)
	}

	/**
	 *
	 */

	const jsonBuffer = Buffer.concat(buffers)
	const jsonString = jsonBuffer.toString()
	const jsonObject = JSON.parse(jsonString)

	/**
	 *
	 */

	return jsonObject

}

/**
 *
 */

module.exports = xml

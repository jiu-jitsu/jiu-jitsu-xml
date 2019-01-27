
/**
 *
 */

const events = require('events')

/**
 *
 */

const UTF8 = 'utf8'

const CHAR_ESCAPE_LEFT = 60
const CHAR_ESCAPE_RIGHT = 62
const CHAR_FORWARD_SLASH = 47
const CHAR_QUESTION = 63
const CHAR_EXCLAMATION = 33
const CHAR_SQUARE_BRACKET_LEFT = 91
const CHAR_SQUARE_BRACKET_RIGHT = 93
const CHAR_DASH = 45

const STATE_TEXT = 0
const STATE_TAG = 1
const STATE_INSTRUCTION = 2
const STATE_COMMENT = 4
const STATE_CDATA = 8
const STATE_IGNORE_COMMENT = 16

const EVENT_TAG_OPEN = 'tag.open'
const EVENT_TAG_CLOSE = 'tag.close'
const EVENT_TAG_INSTRUCTION = 'tag.instraction'
const EVENT_TAG_CDATA = 'tag.cdata'
const EVENT_TEXT = 'text'
const EVENT_END = 'end'

/**
	' is replaced with &apos;
	" is replaced with &quot;
	& is replaced with &amp;
	< is replaced with &lt;
	> is replaced with &gt;
 */

class Xml extends events {

	constructor () {

		super()

		/**
		 * Iterator
		 */

		this.___i = 0

		/**
		 * Stop
		 */

		this.___stop = 0

		/**
		 * State
		 */

		this.___state = 0

		/**
		 * Closed
		 */

		this.___closed = null

		/**
		 * Buffer
		 */

		this.___buffer = Buffer.alloc(0)

	}

	read (chunk) {

		this.___concat(chunk)
		this.___read()

		return this

	}

	end () {

		this.___buffer = null
		this.___buffer = undefined

		this.emit(EVENT_END)

	}

	___concat (chunk) {

		this.___buffer = Buffer.concat([this.___buffer, chunk])

	}

	___read () {

		let closed = false

		for (; this.___i < this.___buffer.length; this.___i++) {

			switch (this.___state) {

				case STATE_TEXT:

					if (this.___buffer[this.___i] === CHAR_ESCAPE_LEFT) {

						this.___onTagStart()

					}

					break

				case STATE_TAG:

					/**
					 * >
					 */

					if (this.___buffer[this.___i] === CHAR_ESCAPE_RIGHT) {

						closed = this.___buffer[this.___i - 1] === CHAR_FORWARD_SLASH

						this.___onTag(closed)

					}

					/**
					 * </
					 */

					if (this.___buffer[this.___i - 1] === CHAR_ESCAPE_LEFT && this.___buffer[this.___i] === CHAR_FORWARD_SLASH) {

						this.___onTagClose()

					}

					/**
					 * <!-
					 */

					if (this.___buffer[this.___i - 2] === CHAR_ESCAPE_LEFT && this.___buffer[this.___i - 1] === CHAR_EXCLAMATION && this.___buffer[this.___i] == CHAR_DASH) {

						this.___onCommentStart()

					}

					/**
					 * <?
					 */

					if (this.___buffer[this.___i - 1] === CHAR_ESCAPE_LEFT && this.___buffer[this.___i] === CHAR_QUESTION) {

						this.___onInstructionStart()

					}

					/**
					 * <![
					 */

					if (this.___buffer[this.___i - 2] === CHAR_ESCAPE_LEFT && this.___buffer[this.___i - 1] === CHAR_EXCLAMATION && this.___buffer[this.___i] === CHAR_SQUARE_BRACKET_LEFT) {

						this.___onCDATAStart()

					}

					break

				case STATE_IGNORE_COMMENT:

					if (this.___buffer[this.___i - 2] === CHAR_DASH && this.___buffer[this.___i - 1] === CHAR_DASH && this.___buffer[this.___i] === CHAR_ESCAPE_RIGHT) {

						this.___onCommentEnd()

					}

					break

				case STATE_INSTRUCTION:

					if (this.___buffer[this.___i - 1] === CHAR_QUESTION && this.___buffer[this.___i] === CHAR_ESCAPE_RIGHT) {

						this.___onInstructionEnd()

					}

					break

				case STATE_CDATA:

					if (this.___buffer[this.___i - 2] === CHAR_SQUARE_BRACKET_RIGHT && this.___buffer[this.___i - 1] === CHAR_SQUARE_BRACKET_RIGHT && this.___buffer[this.___i] === CHAR_ESCAPE_RIGHT) {

						this.___onCDATAEnd()

					}

					break

				default:

					break

			}

		}

	}

	___decoding (s, e) {

		return this.___buffer.slice(s, e).toString()

	}

	___onTagStart () {

		const text = this.___decoding(this.___stop, this.___i).trim()

		this.___stop = this.___i + 1
		this.___state = STATE_TAG

		if (text) {

			/**
			 * Send notification
			 */

			this.emit(EVENT_TEXT, text)

		} else {

			/**
			 *
			 */

		}

	}

	___onTag (closed) {

		const text = this.___decoding(this.___stop, closed ? this.___i - 1 : this.___i)
		const tag = this.___parseTag(text)

		this.___stop = this.___i + 1
		this.___state = STATE_TEXT

		if (!this.___closed) {

			/**
			 * Send notification
			 */

			this.emit(EVENT_TAG_OPEN, tag)

		} else {

			/**
			 * Send notification
			 */

			this.emit(EVENT_TAG_CLOSE, tag)

		}

		this.___closed = false

	}

	___onTagClose () {

		this.___stop = this.___i + 1
		this.___closed = true

	}

	___onCommentStart () {

		this.___stop = this.___i + 1
		this.___state = STATE_IGNORE_COMMENT

	}

	___onCommentEnd () {

		this.___stop = this.___i + 1
		this.___state = STATE_TEXT

	}

	___onInstructionStart () {

		this.___stop = this.___i + 1
		this.___state = STATE_INSTRUCTION

	}

	___onInstructionEnd () {

		const text = this.___decoding(this.___stop, this.___i - 1)
		const tag = this.___parseTag(text)

		this.___stop = this.___i + 1
		this.___state = STATE_TEXT

		/**
		 * Send notification
		 */

		this.emit(EVENT_TAG_INSTRUCTION, tag)

	}

	___onCDATAStart () {

		this.___stop = this.___i + 1
		this.___state = STATE_CDATA

	}

	___onCDATAEnd () {

		const text = this.___decoding(this.___stop, this.___i - 1).slice(text.indexOf('[') + 1, text.lastIndexOf(']'))

		this.___stop = this.___i + 1
		this.___state = STATE_TEXT

		/**
		 * Send notification
		 */

		this.emit(EVENT_TAG_CDATA, text)

	}

	/**
	 * Helper to parse a tag string 'xml version="2.0" encoding="utf-8"' with regexp.
	 * @param {string} text the tag string.
	 * @return {object} {name, attributes}
	 */

	___parseTag (text) {

		const splited = text.split(/\s+(?=[\w:]+=)/g)
		const name = splited.shift()
		const attrs = {}

		splited.forEach(attr => {

			const [
				name,
				value
			] = attr.split('=')

			attrs[name] = value.trim().replace(/"|'/g, '')

		})

		return {
			name,
			attrs
		}

	}

}

/**
 *
 */

module.exports = Xml



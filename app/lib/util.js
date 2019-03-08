'use strict'

/**
 * @module util
 */

const fromBase64 = b64 => Buffer.from(b64, 'base64')
const toBase64 = x => Buffer.from(x).toString('base64')

exports.encode = msg => {
  const length = Buffer.alloc(2)
  msg = Buffer.from(JSON.stringify(msg))

  length.writeUInt16BE(msg.byteLength)

  return Buffer.concat([ length, msg ])
}

exports.decoder = conn => {
  const buf = Buffer.alloc(4096)

  let idx = 0
  let len = 0
  let msg = ''

  conn.on('data', chunk => {
    chunk.copy(buf, idx)
    idx += chunk.length

    if (!len && idx >= 2) {
      len = buf.readUInt16BE()

      if (2 + len > 4096) {
        const err = new Error('Message length exceeds buffer size')
        return conn.destroy(err)
      }
    }

    if (len && 2 + len <= idx) {
      msg = JSON.parse(buf.slice(2, 2 + len).toString())
      conn.emit('message', msg)

      if (2 + len < idx) {
        buf.slice(2 + len, idx).copy(buf)
      }

      idx -= 2 + len
      buf.fill(0, idx)
      len = 0
    }
  })
}

exports.deserialize = b64 => {
  try {
    const str = fromBase64(b64).toString()
    let { ciphertext, salt, nonce, tag, ...rest } = JSON.parse(str)

    exports.validateRest(rest)

    ciphertext = fromBase64(ciphertext)
    salt = fromBase64(salt)
    nonce = fromBase64(nonce)
    tag = fromBase64(tag)

    return { ciphertext, salt, nonce, tag }
  } catch (_) {
    throw new Error('Invalid description')
  }
}

exports.serialize = ({ ciphertext, salt, nonce, tag, ...rest }) => {
  try {
    exports.validateRest(rest)

    ciphertext = toBase64(ciphertext)
    salt = toBase64(salt)
    nonce = toBase64(nonce)
    tag = toBase64(tag)

    const str = JSON.stringify({ ciphertext, salt, nonce, tag })

    return toBase64(str)
  } catch (_) {
    throw new Error('Invalid description')
  }
}

exports.validateFilename = filename => {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Expected filename to be a non-empty string')
  }
}

exports.validatePassword = password => {
  if (!password || typeof password !== 'string') {
    throw new Error('Expected password to be a non-empty string')
  }
}

exports.validatePlaintext = plaintext => {
  const isBuffer = Buffer.isBuffer(plaintext) && plaintext.byteLength
  const isString = typeof plaintext === 'string' && plaintext
  const valid = isBuffer || isString

  if (!valid) {
    throw new Error('Expected plaintext to be a non-empty buffer or string')
  }
}

exports.validateRest = rest => {
  if (Object.keys(rest).length) {
    throw new Error('Unexpected parameters')
  }
}

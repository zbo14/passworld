'use strict'

const fromBase64 = b64 => Buffer.from(b64, 'base64')
const toBase64 = x => Buffer.from(x).toString('base64')

/**
 * @typedef  {Object}  Description
 *
 * @property {Buffer}  ciphertext - the encrypted payload
 * @property {Buffer}  nonce      - the nonce for AES-GCM encryption/decryption
 * @property {Buffer}  salt       - the salt for scrypt
 * @property {Buffer}  tag        - the authentication tag for AES-GCM encryption/decryption
 */

exports.deserialize = b64 => {
  try {
    const str = fromBase64(b64).toString()
    let { ciphertext, salt, nonce, tag } = JSON.parse(str)

    ciphertext = fromBase64(ciphertext)
    salt = fromBase64(salt)
    nonce = fromBase64(nonce)
    tag = fromBase64(tag)

    return { ciphertext, salt, nonce, tag }
  } catch (_) {
    throw new Error('Invalid description')
  }
}

exports.serialize = ({ ciphertext, salt, nonce, tag }) => {
  try {
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

const validators = {
  filename (filename) {
    if (typeof filename !== 'string' || !filename) {
      throw new Error('Expected filename to be a non-empty string')
    }
  },

  length (length) {
    if (!Number.isInteger(length) || length <= 0) {
      throw new Error('Expected length to be an integer > 0')
    }
  },

  overwrite (overwrite) {
    if (overwrite !== 'yes' && overwrite !== 'no') {
      throw new Error('Expected overwrite to be \'yes\' or \'no\'')
    }
  },

  password (password) {
    if (typeof password !== 'string' || !password) {
      throw new Error('Expected password to be a non-empty string')
    }
  }
}

exports.validate = (key, value) => {
  const validate = validators[ key ]

  if (!validate) throw new Error('Unrecognized key')

  validate(value)
}

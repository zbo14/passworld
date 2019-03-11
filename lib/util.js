'use strict'

const fromBase64 = b64 => Buffer.from(b64, 'base64')
const toBase64 = x => Buffer.from(x).toString('base64')

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

exports.validateFilename = filename => {
  if (typeof filename !== 'string' || !filename) {
    throw new Error('Expected filename to be a non-empty string')
  }
}

exports.validatePassword = password => {
  if (typeof password !== 'string' || !password) {
    throw new Error('Expected password to be a non-empty string')
  }
}

exports.validateLength = length => {
  if (!Number.isInteger(length) || length < 1) {
    throw new Error('Expected length to be an integer > 0')
  }
}

exports.validateOverwrite = overwrite => {
  if (overwrite !== 'yes' && overwrite !== 'no') {
    throw new Error('Expected overwrite to be \'yes\' or \'no\'')
  }
}

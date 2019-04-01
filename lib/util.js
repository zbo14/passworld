'use strict'

const { promisify } = require('util')
const readdir = promisify(require('fs').readdir)

exports.listFilenames = async (path, recurse = false, root = true) => {
  const files = await readdir(path).catch(() => [])

  if (!files.length) return [ path ]

  const filenames = []
  const paths = files.map(file => path + '/' + file)

  if (recurse || root) {
    const promises = paths.map(path => exports.listFilenames(path, recurse, false))
    const results = await Promise.all(promises)
    results.forEach(result => filenames.push(...result))
  }

  return filenames
}

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

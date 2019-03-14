'use strict'

const crypto = require('crypto')
const { promisify } = require('util')
const util = require('./util')

/**
 * @module crypto
 */

const scrypt = promisify(crypto.scrypt)
const genKey = (password, salt) => scrypt(Buffer.from(password), salt, 32)

/**
 * A promisified version of #randomBytes() from the node crypto module
 *
 * @method
 *
 * @param  {Number}  length - the number of bytes to generate
 *
 * @return {Promise}        - promise that resolves a buffer
 */
exports.randomBytes = promisify(crypto.randomBytes)

/**
 * Decrypt a description with a password.
 *
 * @param  {String}  description - the serialized description
 * @param  {String}  password    - the password to decrypt with
 *
 * @return {Promise}             - promise that resolves the plaintext
 */
exports.decrypt = async (description, password) => {
  description = util.deserialize(description)
  const key = await genKey(password, description.salt)

  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, description.nonce)

    decipher.setAuthTag(description.tag)

    const buf = Buffer.concat([
      decipher.update(description.ciphertext),
      decipher.final()
    ])

    return buf.toString()
  } catch (_) {
    throw new Error('Decryption failed')
  }
}

/**
 * Encrypt a plaintext with a password.
 *
 * @param  {String}  plaintext - the plaintext to encrypt
 * @param  {String}  password  - the password to encrypt with
 *
 * @return {Promise}           - promise that resolves the serialized description
 */
exports.encrypt = async (plaintext, password) => {
  const [ nonce, salt ] = await Promise.all([
    exports.randomBytes(16),
    exports.randomBytes(16)
  ])

  const key = await genKey(password, salt)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, nonce)

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ])

  const tag = cipher.getAuthTag()

  return util.serialize({ ciphertext, nonce, salt, tag })
}

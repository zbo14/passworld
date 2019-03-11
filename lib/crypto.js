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
 * @param  {Number}  length
 *
 * @return {Promise}
 */
exports.randomBytes = promisify(crypto.randomBytes)

/**
 * Decrypt a description with a password.
 *
 * @param  {String}  description
 * @param  {String}  password
 *
 * @return {Promise}
 */
exports.decrypt = async (description, password) => {
  description = util.deserialize(description)
  const key = await genKey(password, description.salt)

  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, description.nonce)

    decipher.setAuthTag(description.tag)

    return Buffer.concat([
      decipher.update(description.ciphertext),
      decipher.final()
    ])
  } catch (_) {
    throw new Error('Decryption failed')
  }
}

/**
 * Encrypt a plaintext with a password.
 *
 * @param  {String}  plaintext
 * @param  {String}  password
 *
 * @return {Promise}
 */
exports.encrypt = async (plaintext, password) => {
  const [ salt, nonce ] = await Promise.all([
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

  return util.serialize({ ciphertext, salt, nonce, tag })
}

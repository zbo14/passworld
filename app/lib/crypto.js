'use strict'

const crypto = require('crypto')
const { promisify } = require('util')
const util = require('./util')

const randomBytes = promisify(crypto.randomBytes)
const scrypt = promisify(crypto.scrypt)
const genKey = (password, salt) => scrypt(Buffer.from(password), salt, 32)

/**
 * Decrypt a description with a password.
 *
 * @param  {String} password
 * @param  {String} description
 *
 * @return {Promise}
 */
exports.decrypt = async (password, description) => {
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
 * @param  {String} password
 * @param  {Buffer} plaintext
 *
 * @return {Promise}
 */
exports.encrypt = async (password, plaintext) => {
  const [ salt, nonce ] = await Promise.all([ randomBytes(16), randomBytes(16) ])
  const key = await genKey(password, salt)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, nonce)
  const ciphertext = Buffer.concat([ cipher.update(plaintext), cipher.final() ])
  const tag = cipher.getAuthTag()

  return util.serialize({ ciphertext, salt, nonce, tag })
}

'use strict'

const crypto = require('crypto')
const { promisify } = require('util')
const zlib = require('zlib')
const util = require('./util')

/** @module crypto */

const gzip = promisify(zlib.gzip)
const gunzip = promisify(zlib.gunzip)
const scrypt = promisify(crypto.scrypt)

const genKey = (password, salt) => scrypt(Buffer.from(password), salt, 32)

/**
 * Encrypt a plaintext with a password.
 *
 * @param  {Buffer}  plaintext      - the plaintext to encrypt
 * @param  {String}  password       - the password to encrypt with
 * @param  {Object}  [options = {}]
 * @param  {Boolean} options.gzip   - do gzip compression before encryption
 *
 * @return {Promise}                - resolves the serialized description
 */
exports.encrypt = async (plaintext, password, options = {}) => {
  let [ nonce, salt ] = await Promise.all([
    exports.randomBytes(16),
    exports.randomBytes(16)
  ])

  const key = await genKey(password, salt)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, nonce)

  if (options.gzip) {
    plaintext = await gzip(plaintext)
  }

  const ciphertext = Buffer.concat([ cipher.update(plaintext), cipher.final() ])
  const tag = cipher.getAuthTag()

  return util.serialize({ ciphertext, nonce, salt, tag })
}

/**
 * Decrypt a description with a password.
 *
 * @param  {String}   description    - the serialized description
 * @param  {String}   password       - the password to decrypt with
 * @param  {Object}   [options = {}]
 * @param  {Boolean}  options.gunzip - do gzip decompression after decryption
 *
 * @return {Promise}                 - promise that resolves the plaintext
 */
exports.decrypt = async (description, password, options = {}) => {
  description = util.deserialize(description)

  const key = await genKey(password, description.salt)

  let plaintext

  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, description.nonce)

    decipher.setAuthTag(description.tag)

    plaintext = Buffer.concat([
      decipher.update(description.ciphertext),
      decipher.final()
    ])
  } catch (_) {
    throw new Error('Decryption failed')
  }

  try {
    return options.gunzip ? await gunzip(plaintext) : plaintext
  } catch (_) {
    throw new Error('Decompression failed')
  }
}

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

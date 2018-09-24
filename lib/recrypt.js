'use strict'

const crypto = require('./crypto')
const util = require('./util')

/**
 * Encrypt a plaintext with a password.
 *
 * @param  {(Buffer|String)}  plaintext
 * @param  {(Buffer|String)}  password
 *
 * @return {Promise}
 */
exports.encrypt = async (plaintext, password) => {
  plaintext = Buffer.isBuffer(plaintext)
    ? plaintext
    : Buffer.from(plaintext)

  const [ salt1, salt2, nonce ] = await Promise.all([
    crypto.randomBytes(16),
    crypto.randomBytes(32),
    crypto.randomBytes(16)
  ])

  const ikm = await crypto.scrypt(password, salt1)
  const key = crypto.hkdf(32, ikm, salt2)
  const { ciphertext, tag } = crypto.encrypt(plaintext, key, nonce)

  return util.serialize({
    ciphertext,
    salt1,
    salt2,
    nonce,
    tag
  })
}

/**
 * Decrypt a plaintext with a password.
 *
 * @param  {String}           description
 * @param  {(Buffer|String)}  password
 * @param  {String}           [encoding]
 *
 * @return {Promise}
 */
exports.decrypt = async (description, password, encoding) => {
  description = util.deserialize(description)

  const ikm = await crypto.scrypt(password, description.salt1)
  const key = crypto.hkdf(32, ikm, description.salt2)

  let plaintext

  try {
    plaintext = crypto.decrypt(description, key)
  } catch (_) {
    throw new Error('Decryption failed')
  }

  return encoding
    ? plaintext.toString(encoding)
    : plaintext
}

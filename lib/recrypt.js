'use strict'

const crypto = require('./crypto')
const util = require('./util')

/**
 * @module recrypt
 */

/**
 * Encrypt a plaintext with a passphrase.
 *
 * @param  {(Buffer|String)}  plaintext
 * @param  {(Buffer|String)}  passphrase
 *
 * @return {Promise}
 */
exports.encrypt = async (plaintext, passphrase) => {
  plaintext = Buffer.isBuffer(plaintext) ? plaintext : Buffer.from(plaintext)

  const [ salt1, salt2, nonce ] = await Promise.all([
    crypto.randomBytes(16),
    crypto.randomBytes(32),
    crypto.randomBytes(16)
  ])

  const ikm = await crypto.slowHash(passphrase, salt1)
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
 * Decrypt a plaintext with a passphrase.
 *
 * @param  {String}           description
 * @param  {(Buffer|String)}  passphrase
 * @param  {String}           [encoding]
 *
 * @return {Promise}
 */
exports.decrypt = async (description, passphrase, encoding) => {
  description = util.deserialize(description)

  const ikm = await crypto.slowHash(passphrase, description.salt1)
  const key = crypto.hkdf(32, ikm, description.salt2)

  try {
    const plaintext = crypto.decrypt(description, key)

    return encoding ? plaintext.toString(encoding) : plaintext
  } catch (_) {
    throw new Error('Decryption failed')
  }
}

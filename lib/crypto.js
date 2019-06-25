'use strict'

const crypto = require('crypto')
const { secretbox } = require('tweetnacl')
const { promisify } = require('util')
const util = require('./util')

/** @module crypto */

const randomBytes = promisify(crypto.randomBytes)
const scrypt = promisify(crypto.scrypt)
const genKey = (password, salt) => scrypt(Buffer.from(password), salt, 32)

/**
 * Encrypt a plaintext with a password.
 *
 * @param  {Buffer}  plaintext - the plaintext to encrypt
 * @param  {String}  password  - the password to encrypt with
 *
 * @return {Promise}           - resolves the serialized bundle
 */
exports.encrypt = async (plaintext, password) => {
  const [ nonce1, nonce2, salt1, salt2 ] = await Promise.all([
    randomBytes(secretbox.nonceLength),
    randomBytes(16),
    randomBytes(16),
    randomBytes(16)
  ])

  const [ key1, key2 ] = await Promise.all([
    genKey(password, salt1),
    genKey(password, salt2)
  ])

  const box = Buffer.from(secretbox(plaintext, nonce1, key1))
  const cipher = crypto.createCipheriv('aes-256-gcm', key2, nonce2)
  const ciphertext = Buffer.concat([ cipher.update(box), cipher.final() ])
  const tag = cipher.getAuthTag()

  return util.serialize({ ciphertext, nonce1, nonce2, salt1, salt2, tag })
}

/**
 * Decrypt a bundle with a password.
 *
 * @param  {String}   bundle   - the serialized bundle
 * @param  {String}   password - the password to decrypt with
 *
 * @return {Promise}           - promise that resolves the plaintext
 */
exports.decrypt = async (bundle, password) => {
  bundle = util.deserialize(bundle)

  const [ key1, key2 ] = await Promise.all([
    genKey(password, bundle.salt1),
    genKey(password, bundle.salt2)
  ])

  let plaintext

  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key2, bundle.nonce2)

    decipher.setAuthTag(bundle.tag)

    const box = Buffer.concat([
      decipher.update(bundle.ciphertext),
      decipher.final()
    ])

    plaintext = secretbox.open(box, bundle.nonce1, key1)

    if (!plaintext) throw new Error()
  } catch (_) {
    throw new Error('Decryption failed')
  }

  return Buffer.from(plaintext)
}

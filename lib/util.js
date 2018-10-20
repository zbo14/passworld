'use strict'

exports.deserialize = str => {
  let obj

  try {
    obj = JSON.parse(Buffer.from(str, 'base64').toString())
  } catch (_) {
    throw new Error('Invalid description')
  }

  obj.ciphertext = Buffer.from(obj.ciphertext, 'base64')
  obj.salt1 = Buffer.from(obj.salt1, 'base64')
  obj.salt2 = Buffer.from(obj.salt2, 'base64')
  obj.nonce = Buffer.from(obj.nonce, 'base64')
  obj.tag = Buffer.from(obj.tag, 'base64')

  return obj
}

exports.serialize = obj => {
  return Buffer.from(
    JSON.stringify({
      ciphertext: obj.ciphertext.toString('base64'),
      salt1: obj.salt1.toString('base64'),
      salt2: obj.salt2.toString('base64'),
      nonce: obj.nonce.toString('base64'),
      tag: obj.tag.toString('base64')
    })
  ).toString('base64')
}

const isObject = x => Object.prototype.toString.call(x).includes('Object')

/**
 * @typedef  {Object}  SetOptions
 *
 * @property  {String}  service         - the name of the service.
 * @property  {String}  passphrase      - the passphrase used to encrypt the password.
 * @property  {Number}  length          - the length of the generated password
 * @property  {String}  [newPassphrase] - the new passphrase (if you're resetting the password).
 */

exports.validateSetOptions = obj => {
  if (!isObject(obj)) {
    throw new Error('Expected options to be an object')
  }

  if (!obj.service || typeof obj.service !== 'string') {
    throw new Error('Expected options.service to be a non-empty string')
  }

  if (!obj.passphrase || typeof obj.passphrase !== 'string') {
    throw new Error('Expected options.passphrase to be a non-empty string')
  }

  if (!Number.isInteger(obj.length) || obj.length < 8) {
    throw new Error('Expected options.length to be an integer >= 8')
  }

  if (Object.prototype.hasOwnProperty.call(obj, 'newPassphrase')) {
    if (!obj.newPassphrase || typeof obj.newPassphrase !== 'string') {
      throw new Error('Expected options.newPassphrase to be a non-empty string')
    }
  }
}

/**
  * @typedef  {Object}  GetOptions
  *
  * @property  {String}  service    - the name of the service.
  * @property  {String}  passphrase - the passphrase used to decrypt the password.
  *
  * @return {Promise}
 */

exports.validateGetOptions = obj => {
  if (!isObject(obj)) {
    throw new Error('Expected options to be an object')
  }

  if (!obj.service || typeof obj.service !== 'string') {
    throw new Error('Expected options.service to be a non-empty string')
  }

  if (!obj.passphrase || typeof obj.passphrase !== 'string') {
    throw new Error('Expected options.passphrase to be a non-empty string')
  }
}

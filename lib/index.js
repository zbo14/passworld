'use strict'

const path = require('path')
const crypto = require('./crypto')
const fs = require('./fs')
const { encryptPath, decryptPath } = require('./path')

/** @module passworld */

/**
 * Encrypt a file or directory.
 *
 * @param  {String}  name         - the file or directory name to encrypt
 * @param  {String}  password     - the password to encrypt with
 * @param  {Object}  [opts = {}]
 * @param  {Boolean} opts.gzip    - do gzip compression before encryption
 * @param  {Boolean} opts.rename  - encrypt the file/directory name(s)
 *
 * @return {Promise}              - resolves the path to the encrypted file or directory
 */
exports.encrypt = async (name, password, opts = {}) => {
  const contents = await fs.read(name)
  const oldName = name

  if (opts.rename) {
    name = await encryptPath(oldName, password)
  }

  if (Array.isArray(contents)) {
    opts.rename && await fs.rename(oldName, name)

    const promises = contents.map(sub => {
      const newName = path.join(name, sub)
      return exports.encrypt(newName, password, opts)
    })

    await Promise.all(promises)
  } else {
    const bundle = await crypto.encrypt(contents, password, opts)
    await fs.writeFile(name, bundle, 'utf8')
    opts.rename && await fs.unlink(oldName)
  }

  return name
}

/**
 * Decrypt a file or decrypt the contents of a directory.
 *
 * @param  {String}  name           - the file or directory name to decrypt
 * @param  {String}  password       - the password to decrypt with
 * @param  {Object}  [opts = {}]
 * @param  {Boolean} opts.gunzip    - do gzip decompression after decryption
 * @param  {Boolean} opts.overwrite - overwrite the file or directory with decrypted contents
 * @param  {Boolean} opts.rename    - decrypt the file/directory name(s)
 *
 * @return {Promise}                - resolves decrypted contents or path to decrypted file or directory
 */
exports.decrypt = async (name, password, opts = {}) => {
  const contents = await fs.read(name, 'utf8')
  const oldName = name

  if (opts.rename) {
    name = await decryptPath(oldName, password)
  }

  let output

  if (Array.isArray(contents)) {
    let promises = contents.map(sub => {
      const name = path.join(oldName, sub)
      return exports.decrypt(name, password, opts)
    })

    const results = await Promise.all(promises)

    output = {}

    if (!opts.overwrite) {
      promises = contents.map(async (name, i) => {
        name = opts.rename ? await decryptPath(name, password) : name
        output[name] = results[i]
      })

      await Promise.all(promises)
    } else if (opts.rename) {
      await fs.rename(oldName, name)
    }
  } else {
    output = await crypto.decrypt(contents, password, opts)

    if (opts.overwrite) {
      await fs.writeFile(name, output, opts)
      opts.rename && await fs.unlink(oldName)
    }
  }

  return opts.overwrite ? name : output
}

/**
 * Encrypt pseudo-random base64-encoded data to a file.
 *
 * @param  {String}  name        - the filename to write encrypted data to
 * @param  {String}  password    - the password to encrypt with
 * @param  {Number}  length      - the length of data to generate
 * @param  {Object}  [opts = {}]
 * @param  {Boolean} opts.dump   - resolve the generated plaintext instead of a success message
 * @param  {Boolean} opts.gzip   - do gzip compression before encryption
 * @param  {Boolean} opts.rename - encrypt the filename as well
 *
 * @return {Promise}             - resolves a success message or plaintext
 */
exports.randcrypt = async (name, password, length, opts = {}) => {
  const byteLength = Math.ceil(length * 3 / 4)
  const buf = await crypto.randomBytes(byteLength)
  const str = buf.toString('base64').slice(0, length)
  const plaintext = Buffer.from(str)
  const bundle = await crypto.encrypt(plaintext, password, opts)

  if (opts.rename) {
    name = await encryptPath(name, password)
  }

  try {
    await fs.writeFile(name, bundle)
  } catch (_) {
    throw new Error('Failed to write file')
  }

  return opts.dump ? plaintext.toString() : name
}

'use strict'

const fs = require('fs')
const { promisify } = require('util')
const crypto = require('./crypto')
const { listFilenames } = require('./util')

/** @module passworld */

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const encrypt = async (filename, password, opts) => {
  let plaintext

  try {
    plaintext = await readFile(filename)
  } catch (_) {
    throw new Error('Couldn\'t read file, check the filename')
  }

  const bundle = await crypto.encrypt(plaintext, password, opts)

  await writeFile(filename, bundle, 'utf8')

  return 'Encrypted file!'
}

const decrypt = async (filename, password, opts) => {
  let bundle

  try {
    bundle = await readFile(filename, 'utf8')
  } catch (_) {
    throw new Error('Couldn\'t read file, check the filename')
  }

  const plaintext = await crypto.decrypt(bundle, password, opts)

  if (!opts.overwrite) return plaintext

  await writeFile(filename, plaintext)

  return 'Decrypted file!'
}

/**
 * Encrypt a file or encrypt the contents of a directory.
 *
 * @param  {String}  path         - the path to the file or directory to encrypt
 * @param  {String}  password     - the password to encrypt with
 * @param  {Object}  [opts = {}]
 * @param  {Boolean} opts.gzip    - do gzip compression before encryption
 * @param  {Boolean} opts.recurse - recurse through subdirectories and encrypt their contents
 *
 * @return {Promise}              - resolves a success message
 */
exports.encrypt = async (path, password, opts = {}) => {
  const filenames = await listFilenames(path, opts.recurse)

  if (!filenames.length) {
    const result = await encrypt(path, password, opts)

    return result
  }

  const promises = filenames.map(filename => encrypt(filename, password, opts))

  await Promise.all(promises)

  return 'Encrypted directory!'
}

/**
 * Decrypt a file or decrypt the contents of a directory.
 *
 * @param  {String}  path           - the path to the file or directory to decrypt
 * @param  {String}  password       - the password to decrypt with
 * @param  {Object}  [opts = {}]
 * @param  {Boolean} opts.gunzip    - do gzip decompression after decryption
 * @param  {Boolean} opts.overwrite - overwrite the file or directory
 * @param  {Boolean} opts.recurse   - recurse through subdirectories and decrypt their contents
 *
 * @return {Promise}                - resolves a success message, plaintext, or object with plaintexts
 */
exports.decrypt = async (path, password, opts = {}) => {
  const filenames = await listFilenames(path, opts.recurse)

  if (!filenames.length) {
    const result = await decrypt(path, password, opts)

    return result
  }

  const promises = filenames.map(filename => decrypt(filename, password, opts))
  const results = await Promise.all(promises)

  if (opts.overwrite) return 'Decrypted directory!'

  const result = {}

  filenames.forEach((filename, i) => {
    result[filename] = results[i]
  })

  return result
}

/**
 * Encrypt pseudo-random base64-encoded data to a file.
 *
 * @param  {String}  path        - the path to the file to write encrypted data
 * @param  {String}  password    - the password to encrypt with
 * @param  {Number}  length      - the length of data to generate
 * @param  {Object}  [opts = {}]
 * @param  {Boolean} opts.dump   - resolve the generated plaintext instead of a success message
 * @param  {Boolean} opts.gzip   - do gzip compression before encryption
 *
 * @return {Promise}             - resolves a success message or plaintext
 */
exports.randcrypt = async (path, password, length, opts = {}) => {
  const byteLength = Math.ceil(length * 3 / 4)
  const buf = await crypto.randomBytes(byteLength)
  const str = buf.toString('base64').slice(0, length)
  const plaintext = Buffer.from(str)
  const bundle = await crypto.encrypt(plaintext, password, opts)

  try {
    await writeFile(path, bundle)
  } catch (_) {
    throw new Error('Couldn\'t write file, check the filename')
  }

  return opts.dump ? plaintext.toString() : 'Encrypted random data!'
}

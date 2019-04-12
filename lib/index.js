'use strict'

const fs = require('fs')
const { promisify } = require('util')
const crypto = require('./crypto')
const { listFilenames } = require('./util')

/**
 * @module passworld
 */

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const encrypt = async (filename, password, options) => {
  let plaintext

  try {
    plaintext = await readFile(filename)
  } catch (_) {
    throw new Error('Couldn\'t read file, check the filename')
  }

  const description = await crypto.encrypt(plaintext, password, options)

  await writeFile(filename, description, 'utf8')

  return 'Encrypted file!'
}

const decrypt = async (filename, password, options) => {
  let description

  try {
    description = await readFile(filename, 'utf8')
  } catch (_) {
    throw new Error('Couldn\'t read file, check the filename')
  }

  const plaintext = await crypto.decrypt(description, password, options)

  if (!options.overwrite) return plaintext

  await writeFile(filename, plaintext)

  return 'Decrypted file!'
}

/**
 * Encrypt a file or encrypt the contents of a directory.
 *
 * @param  {String}  path            - the path to the file or directory to encrypt
 * @param  {String}  password        - the password to encrypt with
 * @param  {Object}  [options = {}]
 * @param  {Boolean} options.gzip    - do gzip compression before encryption
 * @param  {Boolean} options.recurse - recurse through subdirectories and encrypt their contents
 *
 * @return {Promise}                 - resolves a success message
 */
exports.encrypt = async (path, password, options = {}) => {
  const filenames = await listFilenames(path, options.recurse)

  if (!filenames.length) {
    const result = await encrypt(path, password, options)

    return result
  }

  const promises = filenames.map(filename => encrypt(filename, password, options))

  await Promise.all(promises)

  return 'Encrypted directory!'
}

/**
 * Decrypt a file or decrypt the contents of a directory.
 *
 * @param  {String}  path              - the path to the file or directory to decrypt
 * @param  {String}  password          - the password to decrypt with
 * @param  {Object}  [options = {}]
 * @param  {Boolean} options.gunzip    - do gzip decompression after decryption
 * @param  {Boolean} options.overwrite - overwrite the file or directory
 * @param  {Boolean} options.recurse   - recurse through subdirectories and decrypt their contents
 *
 * @return {Promise}                   - resolves a success message, plaintext, or object with plaintexts
 */
exports.decrypt = async (path, password, options = {}) => {
  const filenames = await listFilenames(path, options.recurse)

  if (!filenames.length) {
    const result = await decrypt(path, password, options)

    return result
  }

  const promises = filenames.map(filename => decrypt(filename, password, options))
  const results = await Promise.all(promises)

  if (options.overwrite) return 'Decrypted directory!'

  const result = {}

  filenames.forEach((filename, i) => {
    result[filename] = results[i]
  })

  return result
}

/**
 * Encrypt pseudo-random base64-encoded data to a file.
 *
 * @param  {String}  path           - the path to the file to write encrypted data
 * @param  {String}  password       - the password to encrypt with
 * @param  {Number}  length         - the length of data to generate
 * @param  {Object}  [options = {}]
 * @param  {Boolean} options.dump   - resolve the generated plaintext instead of a success message
 * @param  {Boolean} options.gzip   - do gzip compression before encryption
 *
 * @return {Promise}                - resolves a success message or plaintext
 */
exports.randcrypt = async (path, password, length, options = {}) => {
  const byteLength = Math.ceil(length * 3 / 4)
  const buf = await crypto.randomBytes(byteLength)
  const str = buf.toString('base64').slice(0, length)
  const plaintext = Buffer.from(str)
  const description = await crypto.encrypt(plaintext, password, options)

  try {
    await writeFile(path, description)
  } catch (_) {
    throw new Error('Couldn\'t write file, check the filename')
  }

  return options.dump ? plaintext.toString() : 'Encrypted random data!'
}

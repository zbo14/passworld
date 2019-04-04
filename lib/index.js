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

const encrypt = async (filename, password) => {
  let plaintext

  try {
    plaintext = await readFile(filename, 'utf8')
  } catch (_) {
    throw new Error('Couldn\'t read file, check the filename')
  }

  const description = await crypto.encrypt(plaintext, password)

  await writeFile(filename, description, 'utf8')

  return 'Encrypted file!'
}

const decrypt = async (filename, password, overwrite) => {
  let description

  try {
    description = await readFile(filename, 'utf8')
  } catch (_) {
    throw new Error('Couldn\'t read file, check the filename')
  }

  const plaintext = await crypto.decrypt(description, password)

  if (!overwrite) return plaintext.trim()

  await writeFile(filename, plaintext, 'utf8')

  return 'Decrypted file!'
}

/**
 * Encrypt a file or encrypt the contents of a directory.
 *
 * @param  {String}  path              - the path to the file or directory to encrypt
 * @param  {String}  password          - the password to encrypt with
 * @param  {Object}  [options = {}]
 * @param  {Boolean} options.recursive - whether to recurse through subdirectories and encrypt their contents
 *
 * @return {Promise}                   - promise that resolves a success message
 */
exports.encrypt = async (path, password, options = {}) => {
  const filenames = await listFilenames(path, options.recursive)

  if (!filenames.length) {
    const result = await encrypt(path, password)

    return result
  }

  const promises = filenames.map(filename => encrypt(filename, password))

  await Promise.all(promises)

  return 'Encrypted directory!'
}

/**
 * Decrypt a file or decrypt the contents of a directory.
 *
 * @param  {String}  path              - the path to the file or directory to decrypt
 * @param  {String}  password          - the password to decrypt with
 * @param  {Object}  [options = {}]
 * @param  {Boolean} options.overwrite - whether to overwrite the file or directory
 * @param  {Boolean} options.recursive - whether to recurse through subdirectories and decrypt their contents
 *
 * @return {Promise}                   - promise that resolves a success message or plaintext(s)
 */
exports.decrypt = async (path, password, options = {}) => {
  const filenames = await listFilenames(path, options.recursive)

  if (!filenames.length) {
    const result = await decrypt(path, password, options.overwrite)

    return result
  }

  if (options.overwrite) {
    const promises = filenames.map(filename => decrypt(filename, password, true))

    await Promise.all(promises)

    return 'Decrypted directory!'
  }

  const promises = filenames.map(filename => decrypt(filename, password, false))
  const results = await Promise.all(promises)

  const result = filenames
    .map((filename, i) => `${filename}: ${results[i]}`)
    .join('\n')

  return result
}

/**
 * Encrypt random data to a file.
 *
 * @param  {String}  path           - the path to the file to write encrypted data
 * @param  {String}  password       - the password to encrypt with
 * @param  {Number}  length         - the byte length of data to generate
 * @param  {Object}  [options = {}]
 * @param  {Boolean} options.dump   - resolve the generated plaintext instead of success message
 *
 * @return {Promise}                - promise that resolves a success message or plaintext
 */
exports.randcrypt = async (path, password, length, options = {}) => {
  const buf = await crypto.randomBytes(length)
  const plaintext = buf.toString('base64')
  const description = await crypto.encrypt(plaintext, password)

  try {
    await writeFile(path, description, 'utf8')
  } catch (_) {
    throw new Error('Couldn\'t write file, check the filename')
  }

  return options.dump ? plaintext : 'Encrypted random data!'
}

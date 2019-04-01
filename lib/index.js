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
 * Encrypt a file or recursively encrypt the contents of a directory.
 *
 * @param  {String}  pathname - the path to the file or directory to encrypt
 * @param  {String}  password - the password to encrypt with
 *
 * @return {Promise}          - promise that resolves a success message
 */
exports.encrypt = async (pathname, password) => {
  const filenames = await listFilenames(pathname, true)

  if (filenames.length === 1) {
    const result = await encrypt(filenames[0], password)

    return result
  }

  const promises = filenames.map(filename => encrypt(filename, password))

  await Promise.all(promises)

  return 'Encrypted directory!'
}

/**
 * Decrypt a file or recursively decrypt the contents of a directory.
 *
 * @param  {String}  pathname            - the path to the file or directory to decrypt
 * @param  {String}  password            - the password to decrypt with
 * @param  {Boolean} [overwrite = false] - whether to overwrite the encrypted file (ignored if decrypting a directory)
 *
 * @return {Promise}                     - promise that resolves a success message or plaintext
 */
exports.decrypt = async (pathname, password, overwrite = false) => {
  const filenames = await listFilenames(pathname, true)

  if (filenames.length === 1) {
    const result = await decrypt(filenames[0], password, overwrite)

    return result
  }

  const promises = filenames.map(filename => decrypt(filename, password, true))

  await Promise.all(promises)

  return 'Decrypted directory!'
}

/**
 * Encrypt random data to a file.
 *
 * @param  {String}  filename       - the file to write encrypted data to
 * @param  {String}  password       - the password to encrypt with
 * @param  {Number}  length         - the byte length of data to generate
 * @param  {Boolean} [dump = false] - resolve the generated plaintext instead of success message
 *
 * @return {Promise}                - promise that resolves a success message or plaintext
 */
exports.randcrypt = async (filename, password, length, dump = false) => {
  const buf = await crypto.randomBytes(length)
  const plaintext = buf.toString('base64')
  const description = await crypto.encrypt(plaintext, password)

  try {
    await writeFile(filename, description, 'utf8')
  } catch (_) {
    throw new Error('Couldn\'t write file, check the filename')
  }

  return dump ? plaintext : 'Encrypted random data!'
}

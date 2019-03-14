'use strict'

const fs = require('fs')
const { promisify } = require('util')
const crypto = require('./crypto')
const util = require('./util')

/**
 * @module passworld
 */

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

/**
 * Encrypt a file.
 *
 * @param  {String}  filename - the file to encrypt
 * @param  {String}  password - the password to encrypt with
 *
 * @return {Promise}          - promise that resolves a success message
 */
exports.encrypt = async (filename, password) => {
  try {
    util.validateFilename(filename)
    util.validatePassword(password)
  } catch ({ message }) {
    throw new Error(`${message}\n\nUsage:  passworld <encrypt> FILENAME`)
  }

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

/**
 * Encrypt random data to a file.
 *
 * @param  {String}  filename - the file to write encrypted data to
 * @param  {String}  password - the password to encrypt with
 * @param  {Number}  length   - the byte length of data to generate
 *
 * @return {Promise}          - promise that resolves a success message
 */
exports.randcrypt = async (filename, password, length) => {
  try {
    util.validateFilename(filename)
    util.validatePassword(password)
    util.validateLength(length)
  } catch ({ message }) {
    throw new Error(`${message}\n\nUsage:  passworld <randcrypt> FILENAME LENGTH`)
  }

  const plaintext = await crypto.randomBytes(length)
  const description = await crypto.encrypt(plaintext.toString('base64'), password)

  try {
    await writeFile(filename, description, 'utf8')
  } catch (_) {
    throw new Error('Couldn\'t write file, check the filename')
  }

  return 'Encrypted random data!'
}

/**
 * Decrypt a file.
 *
 * @param  {String}  filename            - the file to decrypt
 * @param  {String}  password            - the password to decrypt with
 * @param  {Boolean} [overwrite = false] - overwrite the file with plaintext
 *
 * @return {Promise}                     - promise that resolves the decrypted plaintext or a success message
 */
exports.decrypt = async (filename, password, overwrite = false) => {
  try {
    util.validateFilename(filename)
    util.validatePassword(password)
    util.validateOverwrite(overwrite)
  } catch ({ message }) {
    throw new Error(`${message}\n\nUsage:  passworld <decrypt> FILENAME [OVERWRITE]`)
  }

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

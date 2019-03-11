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
 * @param  {String}  filename
 * @param  {String}  password
 *
 * @return {Promise}
 */
exports.encrypt = async (filename, password) => {
  try {
    util.validateFilename(filename)
    util.validatePassword(password)
  } catch ({ message }) {
    throw new Error(`${message}\n\nUsage:  passworld encrypt FILENAME PASSWORD`)
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
 * @param  {String}  filename
 * @param  {String}  password
 * @param  {Number}  length
 *
 * @return {Promise}
 */
exports.randcrypt = async (filename, password, length) => {
  try {
    util.validateFilename(filename)
    util.validatePassword(password)
    util.validateLength(length)
  } catch ({ message }) {
    throw new Error(`${message}\n\nUsage:  passworld randcrypt FILENAME PASSWORD LENGTH`)
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
 * @param  {String}  filename
 * @param  {String}  password
 * @param  {String}  [overwrite = 'no']
 *
 * @return {Promise}
 */
exports.decrypt = async (filename, password, overwrite = 'no') => {
  try {
    util.validateFilename(filename)
    util.validatePassword(password)
    util.validateOverwrite(overwrite)
  } catch ({ message }) {
    throw new Error(`${message}\n\nUsage:  passworld decrypt FILENAME PASSWORD [OVERWRITE]`)
  }

  let description

  try {
    description = await readFile(filename, 'utf8')
  } catch (_) {
    throw new Error('Couldn\'t read file, check the filename')
  }

  const plaintext = await crypto.decrypt(description, password)

  if (overwrite === 'no') {
    return plaintext.toString().trim()
  }

  await writeFile(filename, plaintext)

  return 'Decrypted file!'
}

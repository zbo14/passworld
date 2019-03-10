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
  util.validateFilename(filename)
  util.validatePassword(password)

  let plaintext

  try {
    plaintext = await readFile(filename, 'utf8')
  } catch (_) {
    throw new Error('File not found')
  }

  const description = await crypto.encrypt(plaintext, password)

  await writeFile(filename, description, 'utf8')

  return 'Successfully encrypted file!'
}

exports.randcrypt = async (filename, password, length) => {
  util.validateFilename(filename)
  util.validatePassword(password)
  util.validateLength(length)

  const plaintext = await crypto.randomBytes(length)
  const description = await crypto.encrypt(plaintext.toString('base64'), password)

  await writeFile(filename, description, 'utf8')

  return 'Successfully encrypted random data!'
}

/**
 * Decrypt a file.
 *
 * @param  {String}  filename
 * @param  {String}  password
 *
 * @return {Promise}
 */
exports.decrypt = async (filename, password) => {
  util.validateFilename(filename)
  util.validatePassword(password)

  const description = await readFile(filename, 'utf8')
  const plaintext = await crypto.decrypt(description, password)

  return plaintext
    .toString()
    .trim()
}

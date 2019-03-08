'use strict'

const fs = require('fs')
const { promisify } = require('util')
const crypto = require('./crypto')
const util = require('./util')

/**
 * @module passworld
 */

const deleteFile = promisify(fs.unlink)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

/**
 * Create an encrypted file.
 *
 * @param  {Object}          params
 * @param  {String}          params.filename
 * @param  {String}          params.password
 * @param  {(Buffer|String)} params.plaintext
 *
 * @return {Promise}
 */
exports.create = async ({ filename, password, plaintext, ...rest }) => {
  util.validateFilename(filename)
  util.validatePassword(password)
  util.validatePlaintext(plaintext)
  util.validateRest(rest)

  try {
    await readFile(filename)
  } catch (_) {
    const description = await crypto.encrypt(password, plaintext)

    await writeFile(filename, description, 'utf8')

    return 'Successfully created file!'
  }

  throw new Error('File already exists')
}

/**
 * Read an encrypted file.
 *
 * @param  {Object} params
 * @param  {String} params.filename
 * @param  {String} params.password
 *
 * @return {Promise}
 */
exports.read = async ({ filename, password, ...rest }) => {
  util.validateFilename(filename)
  util.validatePassword(password)
  util.validateRest(rest)

  let description

  try {
    description = await readFile(filename, 'utf8')
  } catch (_) {
    throw new Error('File not found')
  }

  try {
    const plaintext = await crypto.decrypt(password, description)

    return plaintext.toString()
  } catch (_) {
    throw new Error('Cannot read file: invalid password')
  }
}

/**
 * Update an encrypted file.
 *
 * @param  {Object}          params
 * @param  {String}          params.filename
 * @param  {String}          params.newPassword
 * @param  {String}          params.oldPassword
 * @param  {(Buffer|String)} params.plaintext
 *
 * @return {Promise}
 */
exports.update = async ({ filename, newPassword, oldPassword, plaintext, ...rest }) => {
  util.validateFilename(filename)
  util.validatePassword(newPassword)
  util.validatePassword(oldPassword)
  util.validatePlaintext(plaintext)
  util.validateRest(rest)

  let description

  try {
    description = await readFile(filename, 'utf8')
  } catch (_) {
    throw new Error('File not found')
  }

  try {
    await crypto.decrypt(oldPassword, description)
  } catch (_) {
    throw new Error('Cannot update file: invalid password')
  }

  description = await crypto.encrypt(newPassword, plaintext)

  await writeFile(filename, description, 'utf8')

  return 'Successfully updated file!'
}

/**
 * Delete an encrypted file.
 *
 * @param  {Object} params
 * @param  {String} params.filename
 * @param  {String} params.password
 *
 * @return {Promise}
 */
exports.delete = async ({ filename, password, ...rest }) => {
  util.validateFilename(filename)
  util.validatePassword(password)
  util.validateRest(rest)

  let description

  try {
    description = await readFile(filename, 'utf8')
  } catch (_) {
    throw new Error('File not found')
  }

  try {
    await crypto.decrypt(password, description)
  } catch (_) {
    throw new Error('Cannot delete file: invalid password')
  }

  await deleteFile(filename)

  return 'Successfully deleted file!'
}

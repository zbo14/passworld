'use strict'

const fs = require('fs')
const { promisify } = require('util')
const crypto = require('./crypto')
const recrypt = require('./recrypt')
const util = require('./util')

/**
 * @module passworld
 */

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const write = async (service, passphrase, length) => {
  const plaintext = await crypto.randomBytes(length)
  descriptions[service] = await recrypt.encrypt(plaintext, passphrase)

  return plaintext
    .toString('base64')
    .split('=')
    .shift()
}

let descriptions = {}

/**
 * Open a file and initialize descriptions
 *
 * @param  {String}  filename
 * @param  {Boolean} [init]
 *
 * @return {Promise}
 */
exports.open = async (filename, init) => {
  try {
    const data = await readFile(filename, 'utf8')
    descriptions = JSON.parse(data)

    return true
  } catch (err) {
    if (!init) throw new Error('Cannot open file')

    descriptions = {}

    return false
  }
}

/**
 * Create a password for a service.
 *
 * @param  {String} service
 * @param  {String} passphrase
 * @param  {Number} length
 *
 * @return {Promise}
 */
exports.create = (service, passphrase, length) => {
  util.validateService(service)
  util.validatePassphrase(passphrase)
  util.validateLength(length)

  length = Math.floor(length * 3 / 4)

  if (descriptions[service]) {
    throw new Error(`Password already exists for service '${service}'`)
  }

  return write(service, passphrase, length)
}

/**
 * Read a password for a service.
 *
 * @param  {String} service
 * @param  {String} passphrase
 *
 * @return {Promise}
 */
exports.read = async (service, passphrase) => {
  util.validateService(service)
  util.validatePassphrase(passphrase)

  const description = descriptions[service]

  if (!description) {
    throw new Error(`No password for service '${service}'`)
  }

  const decrypted = await recrypt.decrypt(description, passphrase, 'base64')

  return decrypted
    .split('=')
    .shift()
}

/**
 * Update a password for a service.
 *
 * @param  {String} service
 * @param  {String} passphrase
 * @param  {Number} length
 * @param  {String} [newPassphrase = passphrase]
 *
 * @return {Promise}
 */
exports.update = async (service, passphrase, length, newPassphrase = passphrase) => {
  util.validateService(service)
  util.validatePassphrase(passphrase)
  util.validateLength(length)
  util.validatePassphrase(newPassphrase)

  const description = descriptions[service]

  if (!description) {
    throw new Error(`No password for service '${service}'`)
  }

  try {
    await recrypt.decrypt(description, passphrase, 'base64')
  } catch (_) {
    throw new Error('Invalid passphrase: cannot update password')
  }

  length = Math.floor(length * 3 / 4)

  const result = await write(service, newPassphrase, length)

  return result
}

/**
 * Delete a password for a service.
 *
 * @param  {String} service
 * @param  {String} passphrase
 *
 * @return {Promise}
 */
exports.delete = async (service, passphrase) => {
  util.validateService(service)
  util.validatePassphrase(passphrase)

  const description = descriptions[service]

  if (!description) {
    throw new Error(`No password for service '${service}'`)
  }

  try {
    await recrypt.decrypt(description, passphrase, 'base64')
  } catch (_) {
    throw new Error('Invalid passphrase: cannot delete password')
  }

  delete descriptions[service]
}

/**
 * Save the descriptions to a file
 *
 * @param  {String}  filename
 *
 * @return {Promise}
 */
exports.save = async filename => {
  const data = JSON.stringify(descriptions)

  await writeFile(filename, data, 'utf8')

  descriptions = {}
}

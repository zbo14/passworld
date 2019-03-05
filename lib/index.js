'use strict'

const crypto = require('./crypto')
const recrypt = require('./recrypt')
const util = require('./util')

/**
 * @module passwerk
 */

const descriptions = Object.create(null)

const write = async (service, passphrase, length) => {
  const plaintext = await crypto.randomBytes(length)
  descriptions[service] = await recrypt.encrypt(plaintext, passphrase)

  return plaintext
    .toString('base64')
    .split('=')
    .shift()
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
 * @param {String} service
 * @param {String} passphrase
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

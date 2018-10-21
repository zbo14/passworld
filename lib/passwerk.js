'use strict'

const fs = require('fs')
const crypto = require('./crypto')
const recrypt = require('./recrypt')
const path = require('path')
const { promisify } = require('util')
const util = require('./util')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const pathToService = service => {
  return path.resolve(path.join(__dirname, '..', 'passwords', service))
}

/**
 * @module passwerk
 */

/**
 * Get a password for a service.
 *
 * @param  {GetOptions}  options
 *
 * @return {Promise}
 */
exports.get = async options => {
  util.validateGetOptions(options)

  let description

  try {
    description = await readFile(pathToService(options.service), { encoding: 'utf8' })
  } catch (_) {
    throw new Error(`No password for service: ${options.service}`)
  }

  const decrypted = await recrypt.decrypt(description, options.passphrase, 'base64')

  return decrypted
    .split('=')
    .shift()
}

const write = async (servicePath, options) => {
  const plaintext = await crypto.randomBytes(options.length)
  const description = await recrypt.encrypt(plaintext, options.passphrase)

  await writeFile(servicePath, description, {
    encoding: 'utf8',
    mode: 0o600
  })

  return plaintext
    .toString('base64')
    .split('=')
    .shift()
}

/**
 * Create a password for a service.
 *
 * @param  {CreateOptions} options
 *
 * @return {Promise}
 */
exports.create = async options => {
  util.validateCreateOptions(options)

  const servicePath = pathToService(options.service)

  options.length = Math.floor(options.length * 3 / 4)

  try {
    await readFile(servicePath, { encoding: 'utf8' })
  } catch (_) {
    return write(servicePath, options)
  }

  throw new Error(`Password already exists for service: ${options.service}`)
}

/**
 * Update a password for a service.
 *
 * @param  {UpdateOptions}  options
 *
 * @return {Promise}
 */
exports.update = async options => {
  util.validateUpdateOptions(options)

  const servicePath = pathToService(options.service)

  options.length = Math.floor(options.length * 3 / 4)

  let description

  try {
    description = await readFile(servicePath, { encoding: 'utf8' })
  } catch (_) {
    throw new Error(`No password for service: ${options.service}`)
  }

  try {
    await recrypt.decrypt(description, options.passphrase, 'base64')
  } catch (_) {
    throw new Error('Invalid passphrase: cannot reset password')
  }

  options.passphrase = options.newPassphrase

  return write(servicePath, options)
}

'use strict'

const fs = require('fs')
const crypto = require('./crypto')
const recrypt = require('./recrypt')
const path = require('path')
const { promisify } = require('util')

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
 * @param  {String}  service    - the name of the service.
 * @param  {String}  passphrase - the passphrase used to decrypt the password.
 *
 * @return {Promise}
 */
exports.get = async (service, passphrase) => {
  let description

  try {
    description = await readFile(pathToService(service), { encoding: 'utf8' })
  } catch (_) {
    throw new Error(`No password for service: ${service}`)
  }

  return recrypt.decrypt(description, passphrase, 'hex')
}

const write = async (servicePath, passphrase) => {
  const plaintext = await crypto.randomBytes(32)
  const description = await recrypt.encrypt(plaintext, passphrase)

  await writeFile(servicePath, description, {
    encoding: 'utf8',
    mode: 0o600
  })

  return plaintext.toString('hex')
}

/**
 * Set a password for a service.
 *
 * @param  {String}  service                      - the name of the service.
 * @param  {String}  passphrase                   - the passphrase used to encrypt the password.
 * @param  {String}  [newPassphrase = passphrase] - the new passphrase.
 *
 * @return {Promise}
 */
exports.set = async (service, passphrase, newPassphrase = passphrase) => {
  const servicePath = pathToService(service)

  let description

  try {
    description = await readFile(servicePath, { encoding: 'utf8' })
  } catch (_) {
    return write(servicePath, passphrase)
  }

  try {
    await recrypt.decrypt(description, passphrase, 'hex')
  } catch (_) {
    throw new Error('Invalid passphrase: cannot reset password')
  }

  return write(servicePath, newPassphrase)
}

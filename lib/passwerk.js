'use strict'

const fs = require('fs')
const crypto = require('./crypto')
const recrypt = require('./recrypt')
const { promisify } = require('util')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const path = service => `./passwerds/${service}`

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
    description = await readFile(path(service), { encoding: 'utf8' })
  } catch (_) {
    throw new Error(`No password for service: ${service}`)
  }

  return recrypt.decrypt(description, passphrase, 'hex')
}

/**
 * Set a password for a service.
 *
 * @param  {String}  service    - the name of the service.
 * @param  {String}  passphrase - the passphrase used to encrypt the password.
 *
 * @return {Promise}
 */
exports.set = async (service, passphrase) => {
  const plaintext = await crypto.randomBytes(32)
  const description = await recrypt.encrypt(plaintext, passphrase)
  await writeFile(path(service), description, {
    encoding: 'utf8',
    mode: 0o600
  })
  return plaintext.toString('hex')
}

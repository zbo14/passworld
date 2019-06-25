'use strict'

const crypto = require('./crypto')
const path = require('path')
const util = require('./util')

/** @module passworld */

/**
 * Encrypt a file or directory.
 *
 * @param  {String}  name         - the file or directory name to encrypt
 * @param  {String}  password     - the password to encrypt with
 * @param  {Object}  [opts = {}]
 * @param  {Boolean} opts.gzip    - compress before encryption
 *
 * @return {Promise}
 */
exports.encrypt = async (name, password, opts = {}) => {
  const contents = await util.read(name)

  if (Array.isArray(contents)) {
    const tarname = await util.tar(name, opts)
    const result = await exports.encrypt(tarname, password, opts)

    return result
  }

  const bundle = await crypto.encrypt(contents, password)

  await util.writeFile(name, bundle, 'utf8')
}

/**
 * Decrypt a file or decrypt the contents of a directory.
 *
 * @param  {String}  name     - the file or directory name to decrypt
 * @param  {String}  password - the password to decrypt with
 *
 * @return {Promise}
 */
exports.decrypt = async (name, password) => {
  const bundle = await util.readFile(name, 'utf8')
    .catch(() => {
      throw new Error('Failed to read filename')
    })

  const plaintext = await crypto.decrypt(bundle, password)
  await util.writeFile(name, plaintext)

  const { ext } = path.parse(name)
  const untar = ext === '.tar' || ext === '.tgz'
  untar && await util.untar(name)
}

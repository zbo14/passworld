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
  name = util.rmTrailingSlash(name)
  let contents = await util.read(name)

  if (Array.isArray(contents)) {
    const tarname = await util.tar(name, opts)
    const result = await exports.encrypt(tarname, password, { ...opts, gzip: false })

    return result
  } else if (opts.gzip) {
    ([ contents ] = await Promise.all([ util.gzip(contents), util.unlink(name) ]))
    name += '.gz'
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
  name = util.rmTrailingSlash(name)

  const bundle = await util.readFile(name, 'utf8')
    .catch(() => {
      throw new Error('Failed to read filename')
    })

  const parsed = path.parse(name)
  let plaintext = await crypto.decrypt(bundle, password)

  if (parsed.ext === '.gz') {
    ([ plaintext ] = await Promise.all([ util.gunzip(plaintext), util.unlink(name) ]))
    name = path.join(parsed.dir, parsed.name)
  }

  await util.writeFile(name, plaintext)

  if (parsed.ext === '.tar' || parsed.ext === '.tgz') {
    await util.untar(name)
  }
}

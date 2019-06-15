'use strict'

const fs = require('fs')
const { promisify } = require('util')

/**
 * @param  {String} name       - the file or directory name
 * @param  {String} [encoding] -
 *
 * @return {Promise}
 */
exports.read = (name, encoding) => {
  return exports.readdir(name)
    .catch(() => exports.readFile(name, encoding))
    .catch(() => {
      throw new Error('Failed to read file or directory name')
    })
}

exports.readdir = promisify(fs.readdir)

exports.readFile = promisify(fs.readFile)

exports.rename = promisify(fs.rename)

exports.unlink = promisify(fs.unlink)

exports.writeFile = promisify(fs.writeFile)

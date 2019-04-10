'use strict'

const passworld = require('../../lib')
const util = require('../util')

const usage = [
  'Usage:  passworld <decrypt> [OPTIONS] PATH\n',
  'Options:',
  '  -g    do gzip decompression after decryption',
  '  -o    overwrite the file or directory',
  '  -r    recurse through subdirectories'
].join('\n')

const validate = util.validator(usage)

module.exports = async (path, opts) => {
  validate('path', path)

  const password = await util.getPassword()

  validate('password', password)

  const gunzip = opts.has('-g')
  const overwrite = opts.has('-o')
  const recurse = opts.has('-r')

  const result = await passworld.decrypt(path, password, { gunzip, overwrite, recurse })

  return util.stringify(result)
}
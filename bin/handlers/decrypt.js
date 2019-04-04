'use strict'

const passworld = require('../../lib')
const util = require('../util')

const usage = [
  'Usage:  passworld <decrypt> [OPTIONS] PATH\n',
  'Options:',
  '  -o    overwrite the file or directory',
  '  -r    recurse through subdirectories'
].join('\n')

const validate = util.validator(usage)

module.exports = async (path, opts) => {
  validate('path', path)

  const password = await util.getPassword()

  validate('password', password)

  const overwrite = opts.has('-o')
  const recursive = opts.has('-r')

  const message = await passworld.decrypt(path, password, { overwrite, recursive })

  return message
}

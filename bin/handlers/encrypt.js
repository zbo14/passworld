'use strict'

const passworld = require('../../lib')
const util = require('../util')

const usage = [
  'Usage:  passworld <encrypt> [OPTIONS] PATH\n',
  'Options:',
  '  -g    do gzip compression before encryption',
  '  -r    recurse through subdirectories'
].join('\n')

const validate = util.validator(usage)

module.exports = async (path, opts) => {
  validate('path', path)

  const password = await util.getPassword()

  validate('password', password)

  const gzip = opts.has('-g')
  const recursive = opts.has('-r')

  const result = await passworld.encrypt(path, password, { gzip, recursive })

  return util.stringify(result)
}

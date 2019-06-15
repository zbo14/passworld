'use strict'

const passworld = require('../../lib')
const util = require('../util')

const usage = [
  'Usage:  passworld <encrypt> [OPTIONS] PATH\n',
  'Options:',
  '  -g    do gzip compression before encryption',
  '  -r    encrypt the file/directory name(s)'
].join('\n')

const validate = util.validator(usage)

module.exports = async (path, opts) => {
  validate('path', path)

  const password = await util.getPassword()

  validate('password', password)

  const gzip = opts.has('-g')
  const rename = opts.has('-r')

  const result = await passworld.encrypt(path, password, { gzip, rename })

  return util.stringify(result)
}

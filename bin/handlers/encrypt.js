'use strict'

const passworld = require('../../lib')
const util = require('../util')

const usage = [
  'Usage:  passworld <encrypt> [OPTIONS] PATH\n',
  'Options:',
  '  -g    compress before encryption'
].join('\n')

const validate = util.validator(usage)

module.exports = async (path, opts) => {
  validate('path', path)

  const password = await util.getPassword()

  validate('password', password)

  const gzip = opts.has('-g')

  await passworld.encrypt(path, password, { gzip })

  return 'Encryption successful!'
}

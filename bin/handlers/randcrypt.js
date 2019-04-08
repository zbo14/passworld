'use strict'

const passworld = require('../../lib')
const util = require('../util')

const usage = [
  'Usage:  passworld <randcrypt> [OPTIONS] PATH LENGTH\n',
  'Options:',
  '  -d    dump the generated plaintext to stdout',
  '  -g    do gzip compression before encryption'
].join('\n')

const validate = util.validator(usage)

module.exports = async (path, length, opts) => {
  length = +length

  validate('path', path)
  validate('length', length)

  const password = await util.getPassword()

  validate('password', password)

  const dump = opts.has('-d')
  const result = await passworld.randcrypt(path, password, length, { dump })

  return util.stringify(result)
}

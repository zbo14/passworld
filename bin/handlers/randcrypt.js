'use strict'

const passworld = require('../../lib')
const util = require('../util')

const usage = [
  'Usage:  passworld <randcrypt> [OPTIONS] PATH LENGTH\n',
  'Options:',
  '  -d    dump the generated plaintext to stdout'
].join('\n')

const validate = util.validator(usage)

module.exports = async (path, length, opts) => {
  length = +length

  validate('path', path)
  validate('length', length)

  const password = await util.getPassword()

  validate('password', password)

  const dump = opts.has('-d')
  const message = await passworld.randcrypt(path, password, length, { dump })

  return message
}

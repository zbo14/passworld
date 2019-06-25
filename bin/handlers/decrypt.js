'use strict'

const passworld = require('../../lib')
const util = require('../util')

const usage = 'Usage:  passworld <decrypt> PATH'
const validate = util.validator(usage)

module.exports = async (path, opts) => {
  validate('path', path)

  const password = await util.getPassword()

  validate('password', password)

  await passworld.decrypt(path, password)

  return 'Decryption successful!'
}

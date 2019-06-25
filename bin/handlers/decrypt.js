'use strict'

const passworld = require('../../lib')
const util = require('../util')

const usage = 'Usage:  passworld <decrypt> PATH'
const validate = util.validator(usage)

module.exports = async (path, opts) => {
  validate('path', path)

  const password = await util.getPassword()

  validate('password', password)

  const result = await passworld.decrypt(path, password)

  return result
}

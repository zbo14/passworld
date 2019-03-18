'use strict'

const getPassword = require('./get-password')
const passworld = require('../lib')
const util = require('../lib/util')

const validate = (key, value) => {
  try {
    util.validate(key, value)
  } catch ({ message }) {
    throw new Error(`${message}\n\nUsage:  passworld <randcrypt> FILENAME LENGTH`)
  }
}

module.exports = async (filename, length) => {
  validate('filename', filename)
  validate('length', length = +length)

  const password = await getPassword()

  validate('password', password)

  const message = await passworld.randcrypt(filename, password, length)

  return message
}

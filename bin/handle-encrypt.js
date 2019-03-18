'use strict'

const getPassword = require('./get-password')
const passworld = require('../lib')
const util = require('../lib/util')

const validate = (key, value) => {
  try {
    util.validate(key, value)
  } catch ({ message }) {
    throw new Error(`${message}\n\nUsage:  passworld <encrypt> FILENAME`)
  }
}

module.exports = async filename => {
  validate('filename', filename)

  const password = await getPassword()

  validate('password', password)

  const message = await passworld.encrypt(filename, password)

  return message
}

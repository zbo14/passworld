'use strict'

const getPassword = require('./get-password')
const passworld = require('../lib')
const util = require('../lib/util')

const validate = (key, value) => {
  try {
    util.validate(key, value)
  } catch ({ message }) {
    throw new Error(`${message}\n\nUsage:  passworld <decrypt> FILENAME [OVERWRITE]`)
  }
}

module.exports = async (filename, overwrite = 'no') => {
  validate('filename', filename)
  validate('overwrite', overwrite)

  const password = await getPassword()

  validate('password', password)

  const message = await passworld.decrypt(filename, password, overwrite)

  return message
}

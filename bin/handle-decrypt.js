'use strict'

const getPassword = require('./get-password')
const passworld = require('../lib')
const usage = 'Usage:  passworld <decrypt> FILENAME [OVERWRITE]'
const validate = require('./validate')(usage)

module.exports = async (filename, overwrite = 'no') => {
  validate({ filename, overwrite })

  const password = await getPassword()

  validate({ password })

  const message = await passworld.decrypt(filename, password, overwrite === 'yes')

  return message
}

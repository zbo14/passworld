'use strict'

const getPassword = require('./get-password')
const passworld = require('../lib')
const usage = 'Usage:  passworld <randcrypt> FILENAME LENGTH [DUMP]'
const validate = require('./validate')(usage)

module.exports = async (filename, length, dump = 'yes') => {
  length = +length

  validate({ filename, length, dump })

  const password = await getPassword()

  validate({ password })

  const message = await passworld.randcrypt(filename, password, length, dump === 'yes')

  return message
}

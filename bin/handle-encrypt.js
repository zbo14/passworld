'use strict'

const getPassword = require('./get-password')
const passworld = require('../lib')
const usage = 'Usage:  passworld <encrypt> FILENAME'
const validate = require('./validate')(usage)

module.exports = async filename => {
  validate({ filename })

  const password = await getPassword()

  validate({ password })

  const message = await passworld.encrypt(filename, password)

  return message
}

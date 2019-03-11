#!/usr/bin/env node

'use strict'

const passworld = require('./lib')

const usage = `
Usage:  passworld COMMAND ARGS

Commands:
  encrypt      Encrypt a file
  decrypt      Decrypt a file
  randcrypt    Encrypt random data to a file
`

const run = async () => {
  const [ command, filename, password, length ] = process.argv.slice(2)

  let message

  try {
    switch (command) {
      case 'encrypt':
        message = await passworld.encrypt(filename, password)
        break

      case 'randcrypt':
        message = await passworld.randcrypt(filename, password, +length)
        break

      case 'decrypt':
        message = await passworld.decrypt(filename, password)
        break

      default:
        throw new Error(usage)
    }

    console.log(message)
  } catch ({ message }) {
    console.error(message)
  }
}

run()

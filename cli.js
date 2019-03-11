#!/usr/bin/env node

'use strict'

const passworld = require('./lib')

const usage =
`Usage:  passworld COMMAND ARGS

Commands:
  encrypt      Encrypt a file
  decrypt      Decrypt a file
  randcrypt    Encrypt random data to a file`

const run = async () => {
  const [ command, filename, password, ...rest ] = process.argv.slice(2)

  let message

  try {
    switch (command) {
      case 'encrypt':
        message = await passworld.encrypt(filename, password)
        break

      case 'randcrypt':
        message = await passworld.randcrypt(filename, password, +rest[0])
        break

      case 'decrypt':
        message = await passworld.decrypt(filename, password, rest[0])
        break

      default:
        throw new Error(usage)
    }

    console.log(message + '\n')
  } catch ({ message }) {
    console.error(message + '\n')
  }
}

run()

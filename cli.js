#!/usr/bin/env node

'use strict'

const passworld = require('./lib')

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
        message = 'Usage: passworld <command> [filename] [password] [length]'
    }

    console.log(message)
  } catch ({ message }) {
    console.error(message)
  }
}

run()

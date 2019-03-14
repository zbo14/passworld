#!/usr/bin/env node

'use strict'

const readline = require('readline')
const { Writable } = require('stream')
const passworld = require('./lib')

const usage =
`Usage:  passworld <command> ARGS

Commands:
  encrypt      Encrypt a file
  decrypt      Decrypt a file
  randcrypt    Encrypt random data to a file`

const output = new Writable({
  write (chunk, encoding, cb) {
    output.mute || process.stdout.write(chunk, encoding)
    cb()
  }
})

const rl = readline.createInterface({
  input: process.stdin,
  output,
  terminal: true
})

const run = async () => {
  const [ command, filename, ...rest ] = process.argv.slice(2)

  output.mute = false

  rl.write('Enter password:\n')

  output.mute = true

  rl.prompt()

  const password = await new Promise(resolve => {
    rl.once('line', line => {
      resolve(line.trim())
      rl.close()
    })
  })

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
        if (rest[0] !== 'yes' && rest[0] !== 'no') {
          throw new Error('Expected overwrite to be \'yes\' or \'no\'')
        }

        message = await passworld.decrypt(filename, password, rest[0] === 'yes')
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

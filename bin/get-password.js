'use strict'

const readline = require('readline')
const { Writable } = require('stream')

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

module.exports = () => {
  return new Promise(resolve => {
    output.mute = false

    rl.write('Enter password:\n')

    output.mute = true

    rl.prompt()

    rl.once('line', line => {
      resolve(line.trim())
      rl.close()
    })
  })
}

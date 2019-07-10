'use strict'

const readline = require('readline')
const { Writable } = require('stream')

module.exports = () => {
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

  return new Promise(resolve => {
    output.mute = false

    rl.write('Enter password:\n')

    output.mute = true

    rl.once('line', line => {
      resolve(line.trim())
      rl.close()
    })

    rl.prompt()
  })
}

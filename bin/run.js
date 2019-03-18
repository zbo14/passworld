'use strict'

const handleDecrypt = require('./handle-decrypt')
const handleEncrypt = require('./handle-encrypt')
const handleRandcrypt = require('./handle-randcrypt')

const usage =
`Usage:  passworld <command> ARGS
Commands:
  encrypt      Encrypt a file
  decrypt      Decrypt a file
  randcrypt    Encrypt random data to a file`

module.exports = async () => {
  const [ command, ...args ] = process.argv.slice(2)

  let message

  try {
    switch (command) {
      case 'encrypt':
        message = await handleEncrypt(...args)
        break

      case 'randcrypt':
        message = await handleRandcrypt(...args)
        break

      case 'decrypt':
        message = await handleDecrypt(...args)
        break

      default:
        throw new Error(usage)
    }

    console.log(message)
  } catch ({ message }) {
    console.error(message)
  }
}

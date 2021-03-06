'use strict'

const handlers = require('./handlers')

const usage = [
  'Usage:  passworld <command> [OPTIONS] ARGS\n',
  'Commands:',
  '  encrypt      Encrypt a file or directory',
  '  decrypt      Decrypt a file or directory',
  '  recrypt      Decrypt and then encrypt a file or directory'
].join('\n')

module.exports = async () => {
  const [ command, ...params ] = process.argv.slice(2)

  const args = []
  const opts = new Set()

  params.forEach(param => {
    param.startsWith('-')
      ? opts.add(param)
      : args.push(param)
  })

  try {
    switch (command) {
      case 'encrypt':
      case 'decrypt':
      case 'recrypt':
        const message = await handlers[ command ](...args, opts)

        return console.log(message)

      default:
        throw new Error(usage)
    }
  } catch ({ message }) {
    console.error(message)
  }
}

'use strict'

const handlers = require('./handlers')

const usage = [
  'Usage:  passworld <command> [OPTIONS] ARGS\n',
  'Commands:',
  '  encrypt      Encrypt a file or directory',
  '  decrypt      Decrypt a file or directory',
  '  randcrypt    Encrypt random data to a file'
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

  let message

  try {
    switch (command) {
      case 'encrypt':
        message = await handlers.encrypt(...args, opts)
        break

      case 'decrypt':
        message = await handlers.decrypt(...args, opts)
        break

      case 'randcrypt':
        message = await handlers.randcrypt(...args, opts)
        break

      default:
        throw new Error(usage)
    }

    console.log(message)
  } catch ({ message }) {
    console.error(message)
  }
}

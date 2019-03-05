#!/usr/bin/env node

'use strict'

const passworld = require('./lib/passworld')

const [
  command,
  filename,
  service,
  passphrase,
  length,
  newPassphrase
] = process.argv.slice(2)

const exec = async () => {
  switch (command) {
    case 'create':
      await passworld.open(filename, true)
      await passworld.create(service, passphrase, +length)
      await passworld.save(filename)

      return 'Successfully created password!'

    case 'read':
      await passworld.open(filename)

      const password = await passworld.read(service, passphrase)

      return `Your password is: ${password}`

    case 'update':
      await passworld.open(filename)
      await passworld.update(service, passphrase, +length, newPassphrase)
      await passworld.save(filename)

      return 'Successfully updated password!'

    case 'delete':
      await passworld.open(filename)
      await passworld.delete(service, passphrase)
      await passworld.save(filename)

      return 'Successfully deleted password!'

    default:
      return 'Usage: passworld <create|read|update|delete> [...params]'
  }
}

exec()
  .then(console.log)
  .catch(err => console.error(err) || 1)
  .then(process.exit)

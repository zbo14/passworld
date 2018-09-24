'use strict'

const fs = require('fs')
const crypto = require('./crypto')
const recrypt = require('./recrypt')

const path = service => `./passwerds/${service}`

const read = service => {
  return new Promise((resolve, reject) => {
    fs.readFile(path(service), { encoding: 'utf8' }, (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
}

const write = (service, description) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path(service), description, {
      encoding: 'utf8',
      mode: 0o600
    },
    /* istanbul ignore next */
    err => err ? reject(err) : resolve()
    )
  })
}

exports.get = async (service, password) => {
  let description

  try {
    description = await read(service)
  } catch (_) {
    throw new Error(`No password for service: ${service}`)
  }

  return recrypt.decrypt(description, password, 'hex')
}

exports.set = async (service, password) => {
  const plaintext = await crypto.randomBytes(32)
  const description = await recrypt.encrypt(plaintext, password)
  await write(service, description)
  return plaintext.toString('hex')
}

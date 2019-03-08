'use strict'

const { Socket } = require('net')
const util = require('./util')

const client = new Socket()

util.decoder(client)

client.once('end', () => console.log('Disconnected from server'))

client.on('error', ({ message }) => console.error(`Error: ${message}`))

const sender = command => async params => {
  const msg = util.encode({ ...params, command })

  const [ result ] = await Promise.all([
    new Promise((resolve, reject) => {
      client.once('message', resolve)
      setTimeout(() => reject(new Error('Timeout')), 5e3)
    }),

    new Promise((resolve, reject) => {
      client.write(msg, err => {
        err ? reject(err) : resolve()
      })
    })
  ])

  return result
}

const start = port => {
  return new Promise((resolve, reject) => {
    client.connect(port, err => {
      err ? reject(err) : resolve()
    })
  })
}

const stop = () => {
  return new Promise((resolve, reject) => {
    client.end(err => {
      err ? reject(err) : resolve()
    })
  })
}

module.exports = {
  start,
  stop,
  create: sender('create'),
  read: sender('read'),
  update: sender('update'),
  delete: sender('delete')
}

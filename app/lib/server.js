'use strict'

const { Server } = require('net')
const passworld = require('./passworld')
const util = require('./util')

const server = new Server()

const recognizedCommands = [
  'create',
  'read',
  'update',
  'delete'
]

server.on('connection', conn => {
  util.decoder(conn)

  conn.once('end', () => console.log('Client disconnected'))

  conn.on('error', ({ message }) => console.error(`ClientError: ${message}`))

  conn.on('message', async ({ command, ...params }) => {
    let msg

    try {
      if (!recognizedCommands.includes(command)) {
        throw new Error('Unrecognized command')
      }

      msg = await passworld[ command ](params)
    } catch ({ message }) {
      msg = message
    }

    msg = util.encode(msg)

    await new Promise((resolve, reject) => {
      conn.write(msg, err => {
        err ? reject(err) : resolve()
      })
    })
  })
})

server.on('error', ({ message }) => console.error(`ServerError: ${message}`))

const start = port => {
  return new Promise((resolve, reject) => {
    server.listen(port, '0.0.0.0', err => {
      err ? reject(err) : resolve()
    })
  })
}

const stop = () => {
  return new Promise((resolve, reject) => {
    server.close(err => {
      err ? reject(err) : resolve()
    })
  })
}

module.exports = { start, stop }

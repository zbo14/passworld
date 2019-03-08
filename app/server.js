'use strict'

const server = require('./lib/server')

server.start(11223)
  .then(() => console.log('Server started!'))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })

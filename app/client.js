'use strict'

const client = require('./lib/client')

client.start(process.env.port)
  .then(() => console.log('Client started!'))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })

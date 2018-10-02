'use strict'

const action = require('./action')
const heading = require('./heading')
const passphrase = require('./passphrase')
const result = require('./result')
const service = require('./service')

const element = document.createElement('div')
element.classList.add('container')

element.appendChild(heading)
element.appendChild(service)
element.appendChild(passphrase)
element.appendChild(action)
element.appendChild(result)

module.exports = element

'use strict'

const app = require('../app')
const action = require('../elements/action')
const heading = require('../elements/heading')
const navButton = require('../elements/nav-button')
const passphrase = require('../elements/passphrase')
const result = require('../elements/result')
const service = require('../elements/service')

module.exports = passwerk => {
  navButton.onclick = () => {
    passwerk.mode = 'get'
    app.render()
  }

  service.value = ''
  passphrase.value = ''
  heading.innerText = 'Set a password'
  result.hidden = true
  action.innerText = 'Set'
  navButton.innerText = 'Get a password'

  action.onclick = async () => {
    await passwerk.set(service.value, passphrase.value)
    result.innerText = 'Set password!'
    result.hidden = false

    setTimeout(() => {
      result.hidden = true
    }, 3000)
  }
}

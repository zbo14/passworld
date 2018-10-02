'use strict'

const { clipboard } = require('electron')
const app = require('../app')
const action = require('../elements/action')
const heading = require('../elements/heading')
const navButton = require('../elements/nav-button')
const passphrase = require('../elements/passphrase')
const result = require('../elements/result')
const service = require('../elements/service')

module.exports = passwerk => {
  navButton.onclick = () => {
    passwerk.mode = 'set'
    app.render()
  }

  service.value = ''
  passphrase.value = ''
  result.hidden = true
  navButton.innerText = 'Set a password'
  heading.innerText = 'Get a password'
  action.innerText = 'Get'

  action.onclick = async () => {
    const password = await passwerk.get(service.value, passphrase.value)
    clipboard.writeText(password)
    result.innerText = 'Copied password!'
    result.hidden = false

    setTimeout(() => {
      result.hidden = true
    }, 3 * 1e3)

    setTimeout(() => {
      clipboard.clear()
    }, 30 * 1e3)
  }
}

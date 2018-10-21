'use strict'

const { clipboard } = require('electron')
const passwerk = require('../../../lib/passwerk')
const app = require('../app')
const actionButton = require('../elements/action-button')
const heading = require('../elements/heading')
const navCreateView = require('../elements/nav-create-view')
const navChangeView = require('../elements/nav-change-view')
const navGetView = require('../elements/nav-get-view')
const passphraseInput = require('../elements/passphrase-input')
const newPassphraseInput = require('../elements/new-passphrase-input')
const lengthInput = require('../elements/length-input')
const resultPanel = require('../elements/result-panel')
const serviceInput = require('../elements/service-input')

module.exports = () => {
  clearTimeout(resultPanel.timeout)

  serviceInput.value = ''
  passphraseInput.value = ''
  newPassphraseInput.hidden = true
  lengthInput.hidden = true

  actionButton.innerText = 'Get'
  heading.innerText = 'Get a password'

  resultPanel.hidden = true

  actionButton.onclick = async () => {
    clearTimeout(resultPanel.timeout)

    try {
      const password = await passwerk.get({
        service: serviceInput.value,
        passphrase: passphraseInput.value
      })

      clipboard.writeText(password)
      resultPanel.innerText = 'Copied password!'

      setTimeout(() => clipboard.clear(), 30e3)
    } catch (err) {
      resultPanel.innerText = err.message
    } finally {
      resultPanel.hidden = false

      resultPanel.timeout = setTimeout(() => {
        resultPanel.hidden = true
      }, 5e3)
    }
  }
}

'use strict'

const app = require('../app')
const passwerk = require('../../../lib/passwerk')
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
  newPassphraseInput.value = ''
  lengthInput.value = ''

  actionButton.innerText = 'Change'
  heading.innerText = 'Change a password'

  newPassphraseInput.hidden = false
  lengthInput.hidden = false
  resultPanel.hidden = true

  actionButton.onclick = async () => {
    clearTimeout(resultPanel.timeout)

    try {
      await passwerk.update({
        service: serviceInput.value,
        passphrase: passphraseInput.value,
        length: parseInt(lengthInput.value),
        newPassphrase: newPassphraseInput.value
      })

      resultPanel.innerText = 'Changed a password!'
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

'use strict'

const app = require('../app')
const passwerk = require('../../../lib/passwerk')
const actionButton = require('../elements/action-button')
const navCreateView = require('../elements/nav-create-view')
const navChangeView = require('../elements/nav-change-view')
const navGetView = require('../elements/nav-get-view')
const heading = require('../elements/heading')
const passphraseInput = require('../elements/passphrase-input')
const newPassphraseInput = require('../elements/new-passphrase-input')
const lengthInput = require('../elements/length-input')
const resultPanel = require('../elements/result-panel')
const serviceInput = require('../elements/service-input')

module.exports = () => {
  clearTimeout(resultPanel.timeout)

  serviceInput.value = ''
  passphraseInput.value = ''
  lengthInput.value = ''

  actionButton.innerText = 'Create'
  heading.innerText = 'Create a password'

  newPassphraseInput.hidden = true
  lengthInput.hidden = false
  resultPanel.hidden = true

  actionButton.onclick = async () => {
    clearTimeout(resultPanel.timeout)

    try {
      await passwerk.create({
        service: serviceInput.value,
        passphrase: passphraseInput.value,
        length: parseInt(lengthInput.value)
      })

      resultPanel.innerText = 'Created a new password!'
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

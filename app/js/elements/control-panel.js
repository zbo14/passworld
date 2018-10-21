'use strict'

const element = document.createElement('div')

element.classList.add('container')

element.appendChild(require('./heading'))
element.appendChild(require('./service-input'))
element.appendChild(require('./passphrase-input'))
element.appendChild(require('./new-passphrase-input'))
element.appendChild(require('./length-input'))
element.appendChild(require('./action-button'))

module.exports = element

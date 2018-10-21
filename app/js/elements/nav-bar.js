'use strict'

const element = document.createElement('div')

element.classList.add('container', 'row')

element.appendChild(require('./nav-create-view'))
element.appendChild(require('./nav-get-view'))
element.appendChild(require('./nav-change-view'))

module.exports = element

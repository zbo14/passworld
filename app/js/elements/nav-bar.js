'use strict'

const navButton = require('./nav-button')

const element = document.createElement('div')

element.classList.add('container', 'row')
element.appendChild(navButton)

module.exports = element

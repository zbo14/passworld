'use strict'

const controlPanel = require('./control-panel')
const navBar = require('./nav-bar')

const root = document.getElementById('root')

root.appendChild(navBar)
root.appendChild(controlPanel)

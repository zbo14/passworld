'use strict'

const passwerk = require('../../lib/passwerk')
const navChangeView = require('./elements/nav-change-view')
const navCreateView = require('./elements/nav-create-view')
const navGetView = require('./elements/nav-get-view')
const views = require('./views')

require('./elements/root')

navChangeView.onclick = () => {
  passwerk.mode = 'change'
  exports.render()
}

navCreateView.onclick = () => {
  passwerk.mode = 'create'
  exports.render()
}

navGetView.onclick = () => {
  passwerk.mode = 'get'
  exports.render()
}

passwerk.mode = 'create'

exports.render = () => views[passwerk.mode]()

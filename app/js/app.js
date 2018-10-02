'use strict'

const passwerk = require('../../lib/passwerk')
const state = require('./state')
const views = require('./views')

require('./elements/root')

exports.render = () => {
  const view = state(passwerk)
  views[view](passwerk)
}

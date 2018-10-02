'use strict'

module.exports = passwerk => {
  if (passwerk.mode === 'get') {
    return 'get'
  }

  return 'set'
}

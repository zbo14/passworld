'use strict'

module.exports = x => {
  if (Buffer.isBuffer(x)) return x.toString()

  if (typeof x === 'object') {
    return Object.entries(x)
      .map(([ k, v ]) => k + ': ' + module.exports(v))
      .join('\n')
  }

  return x
}

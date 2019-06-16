'use strict'

const flatten = (obj, arr = [], path = '') => {
  Object.entries(obj).forEach(([ k, v ]) => {
    if (Buffer.isBuffer(v)) {
      v = v.toString()
    }

    if (typeof v === 'string') {
      return arr.push([ path + k, v ])
    }

    flatten(v, arr, path + k + '/')
  })

  return arr
}

module.exports = x => {
  if (typeof x === 'string') return x

  if (Buffer.isBuffer(x)) return x.toString()

  const result = flatten(x)
    .sort(([ a ], [ b ]) => a > b ? 1 : -1)
    .map(([ k, v ]) => k + ': ' + v)
    .join('\n')

  return result
}

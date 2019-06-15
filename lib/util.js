'use strict'

exports.serialize = obj => {
  const str = JSON.stringify(obj, (_, v) => {
    return v && v.type === 'Buffer'
      ? Buffer.from(v.data).toString('base64')
      : v
  })

  return Buffer.from(str).toString('base64')
}

exports.deserialize = b64 => {
  try {
    const str = Buffer.from(b64, 'base64')

    return JSON.parse(str, (_, v) => {
      return typeof v === 'string'
        ? Buffer.from(v, 'base64')
        : v
    })
  } catch (_) {
    throw new Error('Invalid bundle')
  }
}

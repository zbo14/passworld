'use strict'

exports.deserialize = b64 => {
  try {
    const str = Buffer.from(b64, 'base64').toString()
    const obj = JSON.parse(str)

    obj.ciphertext = Buffer.from(obj.ciphertext, 'base64')
    obj.salt1 = Buffer.from(obj.salt1, 'base64')
    obj.salt2 = Buffer.from(obj.salt2, 'base64')
    obj.nonce = Buffer.from(obj.nonce, 'base64')
    obj.tag = Buffer.from(obj.tag, 'base64')

    return obj
  } catch (_) {
    throw new Error('Invalid description')
  }
}

exports.serialize = obj => {
  const str = JSON.stringify({
    ciphertext: obj.ciphertext.toString('base64'),
    salt1: obj.salt1.toString('base64'),
    salt2: obj.salt2.toString('base64'),
    nonce: obj.nonce.toString('base64'),
    tag: obj.tag.toString('base64')
  })

  return Buffer.from(str).toString('base64')
}

exports.validateService = service => {
  if (!service || typeof service !== 'string') {
    throw new Error('Expected service to be a non-empty string')
  }
}

exports.validatePassphrase = passphrase => {
  if (!passphrase || typeof passphrase !== 'string') {
    throw new Error('Expected passphrase to be a non-empty string')
  }
}

exports.validateLength = length => {
  if (!Number.isInteger(length) || length < 8) {
    throw new Error('Expected length to be an integer >= 8')
  }
}

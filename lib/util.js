'use strict'

exports.deserialize = str => {
  let obj

  try {
    obj = JSON.parse(Buffer.from(str, 'base64').toString())
  } catch (_) {
    throw new Error('Invalid description')
  }

  obj.ciphertext = Buffer.from(obj.ciphertext, 'base64')
  obj.salt1 = Buffer.from(obj.salt1, 'base64')
  obj.salt2 = Buffer.from(obj.salt2, 'base64')
  obj.nonce = Buffer.from(obj.nonce, 'base64')
  obj.tag = Buffer.from(obj.tag, 'base64')

  return obj
}

exports.serialize = obj => {
  return Buffer.from(
    JSON.stringify({
      ciphertext: obj.ciphertext.toString('base64'),
      salt1: obj.salt1.toString('base64'),
      salt2: obj.salt2.toString('base64'),
      nonce: obj.nonce.toString('base64'),
      tag: obj.tag.toString('base64')
    })
  ).toString('base64')
}

'use strict'

const crypto = require('crypto')

exports.randomBytes = length => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(length, (err, result) => {
      /* istanbul ignore next */
      err ? reject(err) : resolve(result)
    })
  })
}

const hmac = (key, data) => {
  const hmac = crypto.createHmac('sha256', key)
  hmac.update(data)
  return hmac.digest()
}

exports.hkdf = (length, ikm, salt, info = Buffer.alloc(0)) => {
  const prk = hmac(salt, ikm)
  const okm = []
  let t = []

  for (let i = 0; i < Math.ceil(length / 32); i++) {
    t = hmac(prk, Buffer.from([ ...t, ...info, 1 + i ]))
    okm.push(t)
  }

  return Buffer.concat(okm).slice(0, length)
}

exports.scrypt = (password, salt) => {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, ikm) => {
      /* istanbul ignore next */
      err ? reject(err) : resolve(ikm)
    })
  })
}

exports.encrypt = (plaintext, key, nonce) => {
  const cipher = crypto.createCipheriv('aes-256-gcm', key, nonce)

  const ciphertext = Buffer.concat([
    cipher.update(plaintext),
    cipher.final()
  ])

  const tag = cipher.getAuthTag()

  return { ciphertext, tag }
}

exports.decrypt = (description, key) => {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, description.nonce)

  decipher.setAuthTag(description.tag)

  return Buffer.concat([
    decipher.update(description.ciphertext),
    decipher.final()
  ])
}

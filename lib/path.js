'use strict'

const path = require('path')
const crypto = require('./crypto')

exports.encryptPath = async (pathname, password) => {
  const { dir, base } = path.parse(pathname)
  let newBase = await crypto.encrypt(base, password)
  newBase = newBase.replace(/\//, '-')

  return path.join(dir, newBase)
}

exports.decryptPath = async (pathname, password) => {
  let { dir, base } = path.parse(pathname)
  base = base.replace(/-/, '/')
  const newBase = (await crypto.decrypt(base, password)).toString()

  return path.join(dir, newBase)
}

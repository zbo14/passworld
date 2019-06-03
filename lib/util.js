'use strict'

const { promisify } = require('util')
const readdir = promisify(require('fs').readdir)

exports.listFilenames = async (path, recurse = false, root = true) => {
  let files

  try {
    files = await readdir(path)
  } catch (_) {
    return root ? [] : [ path ]
  }

  const filenames = []
  const paths = files.map(file => path + '/' + file)

  if (recurse || root) {
    const promises = paths.map(path => exports.listFilenames(path, recurse, false))
    const results = await Promise.all(promises)
    results.forEach(result => filenames.push(...result))
  }

  return filenames
}

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

'use strict'

const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const exec = promisify(require('child_process').exec)

const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const rename = promisify(fs.rename)
const writeFile = promisify(fs.writeFile)

const deserialize = b64 => {
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

const read = async (name, encoding) => {
  const [ files, data ] = await Promise.all([
    readdir(name).catch(() => {}),
    readFile(name, encoding).catch(() => {})
  ])

  if (files) return files
  if (data) return data

  throw new Error('Failed to read file or directory name')
}

const serialize = obj => {
  const str = JSON.stringify(obj, (_, v) => {
    return v && v.type === 'Buffer'
      ? Buffer.from(v.data).toString('base64')
      : v
  })

  return Buffer.from(str).toString('base64')
}

const tar = async (dirname, { gzip }) => {
  const opts = 'cf' + (gzip ? 'z' : '')
  const tarname = dirname + (gzip ? '.tgz' : '.tar')
  const cmd = [ 'tar', opts, tarname, '-C', dirname, '.' ].join(' ')

  await exec(`${cmd} && rm -r ${dirname}`)

  return tarname
}

const untar = async tarname => {
  const { dir, ext, name } = path.parse(tarname)
  const dirname = path.join(dir, name)
  const opts = 'xf' + (ext === '.tgz' ? 'z' : '')
  const cmd = [ 'tar', opts, tarname, '-C', dirname ].join(' ')

  await exec(`mkdir ${dirname} && ${cmd} && rm ${tarname}`)

  return dirname
}

module.exports = {
  deserialize,
  exec,
  read,
  readdir,
  readFile,
  rename,
  serialize,
  tar,
  untar,
  writeFile
}

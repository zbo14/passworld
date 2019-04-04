'use strict'

const assert = require('assert')
const { promisify } = require('util')
const cp = require('child_process')
const exec = promisify(cp.exec)
const passworld = require('../lib')

const write = (process, password) => {
  return new Promise(resolve => {
    process.stdin.write(password, resolve)
  })
}

const read = process => {
  return new Promise((resolve, reject) => {
    process.stderr.once('data', chunk => {
      const msg = chunk.toString().trim()
      msg ? resolve(msg) : read(process).then(resolve)
    })

    process.stdout.once('data', chunk => {
      const msg = chunk.toString().trim()
      msg ? resolve(msg) : read(process).then(resolve)
    })
  })
}

const dirname = '/tmp/foo'
const filename = `${dirname}/bar`
const password = 'oogly boogly'
const plaintext = 'secreting secrets so secretive'
const length = 30

describe('CLI', function () {
  this.timeout(5e3)

  it('handles unrecognized command', async () => {
    const subprocess = cp.spawn('node', [ 'bin', 'ecrypt' ])
    const result = await read(subprocess)
    assert.strictEqual(result, [
      'Usage:  passworld <command> [OPTIONS] ARGS\n',
      'Commands:',
      '  encrypt      Encrypt a file or directory',
      '  decrypt      Decrypt a file or directory',
      '  randcrypt    Encrypt random data to a file'
    ].join('\n'))
  })

  describe('#encrypt()', () => {
    beforeEach(async () => {
      await exec([
        `mkdir ${dirname}`,
        `mkdir ${dirname}/baz`,
        `echo "${plaintext}" > ${filename}`,
        `echo "levels" > ${dirname}/baz/bam`
      ].join(' && '))
    })

    afterEach(async () => {
      await exec(`rm -rf ${dirname}`)
    })

    it('encrypts file', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'encrypt', filename ])
      let result = await read(subprocess)
      assert.strictEqual(result, 'Enter password:')
      await write(subprocess, password + '\n')
      result = await read(subprocess)
      assert.strictEqual(result, 'Encrypted file!')
    })

    it('encrypts directory', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'encrypt', dirname ])
      let result = await read(subprocess)
      assert.strictEqual(result, 'Enter password:')
      await write(subprocess, password + '\n')
      result = await read(subprocess)
      assert.strictEqual(result, 'Encrypted directory!')
    })

    it('encrypts directory and subdirectories', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'encrypt', '-r', dirname ])
      let result = await read(subprocess)
      assert.strictEqual(result, 'Enter password:')
      await write(subprocess, password + '\n')
      result = await read(subprocess)
      assert.strictEqual(result, 'Encrypted directory!')
    })

    it('errors when no path is passed', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'encrypt' ])
      const result = await read(subprocess)

      assert.strictEqual(result, [
        'Expected path to be a non-empty string\n',
        'Usage:  passworld <encrypt> [OPTIONS] PATH\n',
        'Options:',
        '  -r    recurse through subdirectories'
      ].join('\n'))
    })

    it('errors when no password is passed', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'encrypt', filename ])
      let result = await read(subprocess)
      assert.strictEqual(result, 'Enter password:')
      await write(subprocess, '\n')
      result = await read(subprocess)

      assert.strictEqual(result, [
        'Expected password to be a non-empty string\n',
        'Usage:  passworld <encrypt> [OPTIONS] PATH\n',
        'Options:',
        '  -r    recurse through subdirectories'
      ].join('\n'))
    })
  })

  describe('#decrypt()', () => {
    beforeEach(async () => {
      await exec([
        `mkdir ${dirname}`,
        `mkdir ${dirname}/baz`,
        `echo "${plaintext}" > ${filename}`,
        `echo "levels" > ${dirname}/baz/bam`
      ].join(' && '))

      await passworld.encrypt(dirname, password, { recursive: true })
    })

    afterEach(async () => {
      await exec(`rm -rf ${dirname}`)
    })

    it('decrypts file', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'decrypt', filename ])
      let result = await read(subprocess)
      assert.strictEqual(result, 'Enter password:')
      await write(subprocess, password + '\n')
      result = await read(subprocess)
      assert.strictEqual(result, plaintext)
    })

    it('decrypts directory', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'decrypt', dirname ])
      let result = await read(subprocess)
      assert.strictEqual(result, 'Enter password:')
      await write(subprocess, password + '\n')
      result = await read(subprocess)
      assert.strictEqual(result, '/tmp/foo/bar: secreting secrets so secretive')
    })

    it('decrypts directory and its subdirectories', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'decrypt', '-r', dirname ])
      let result = await read(subprocess)
      assert.strictEqual(result, 'Enter password:')
      await write(subprocess, password + '\n')
      result = await read(subprocess)
      assert.strictEqual(result,
        '/tmp/foo/bar: secreting secrets so secretive\n' +
        '/tmp/foo/baz/bam: levels'
      )
    })

    it('errors when no path is passed', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'decrypt' ])
      const result = await read(subprocess)

      assert.strictEqual(result, [
        'Expected path to be a non-empty string\n',
        'Usage:  passworld <decrypt> [OPTIONS] PATH\n',
        'Options:',
        '  -o    overwrite the file or directory',
        '  -r    recurse through subdirectories'
      ].join('\n'))
    })

    it('errors when no password is passed', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'decrypt', filename ])
      let result = await read(subprocess)
      assert.strictEqual(result, 'Enter password:')
      await write(subprocess, '\n')
      result = await read(subprocess)

      assert.strictEqual(result, [
        'Expected password to be a non-empty string\n',
        'Usage:  passworld <decrypt> [OPTIONS] PATH\n',
        'Options:',
        '  -o    overwrite the file or directory',
        '  -r    recurse through subdirectories'
      ].join('\n'))
    })
  })

  describe('#randcrypt()', () => {
    beforeEach(async () => {
      await exec(`mkdir ${dirname}`)
    })

    afterEach(async () => {
      await exec(`rm -rf ${dirname}`)
    })

    it('encrypts random data', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'randcrypt', filename, length ])
      let result = await read(subprocess)
      assert.strictEqual(result, 'Enter password:')
      await write(subprocess, password + '\n')
      result = await read(subprocess)
      assert.strictEqual(result, 'Encrypted random data!')
    })

    it('encrypts random data and dumps plaintext', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'randcrypt', '-d', filename, length ])
      let result = await read(subprocess)
      assert.strictEqual(result, 'Enter password:')
      await write(subprocess, password + '\n')
      result = await read(subprocess)
      const buf = Buffer.from(result, 'base64')
      assert.strictEqual(buf.byteLength, 30)
    })

    it('errors when bad length is passed', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'randcrypt', filename, '30.3' ])
      const result = await read(subprocess)

      assert.strictEqual(result, [
        'Expected length to be an integer > 0\n',
        'Usage:  passworld <randcrypt> [OPTIONS] PATH LENGTH\n',
        'Options:',
        '  -d    dump the generated plaintext to stdout'
      ].join('\n'))
    })
  })
})

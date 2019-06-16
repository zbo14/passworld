'use strict'

const assert = require('assert')
const { promisify } = require('util')
const cp = require('child_process')
const exec = promisify(cp.exec)
const passworld = require('../lib')

const write = (process, data) => {
  return new Promise(resolve => {
    process.stdin.write(data + '\n', resolve)
  })
}

const read = process => {
  return new Promise(resolve => {
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

const dirname1 = `${__dirname}/foo`
const dirname2 = `${dirname1}/baz`
const filename1 = `${dirname1}/bar`
const filename2 = `${dirname2}/bam`
const plaintext1 = Buffer.from('secreting secrets so secretive')
const plaintext2 = Buffer.from('levels')
const password = 'oogly boogly'
const length = 30

describe('CLI', function () {
  this.timeout(5e3)

  beforeEach(async () => {
    await exec([
      `mkdir ${dirname1} ${dirname2}`,
      `echo "${plaintext1}\\c" > ${filename1}`,
      `echo "${plaintext2}\\c" > ${filename2}`
    ].join(' && '))
  })

  afterEach(async () => {
    await exec(`rm -rf ${dirname1}`)
  })

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
    it('encrypts file', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'encrypt', filename1 ])
      let result = await read(subprocess)
      assert.strictEqual(result, 'Enter password:')
      await write(subprocess, password)
      result = await read(subprocess)
      assert.strictEqual(result, filename1)
    })

    it('encrypts file and filename', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'encrypt', '-r', filename1 ])
      let result = await read(subprocess)
      assert.strictEqual(result, 'Enter password:')
      await write(subprocess, password)
      result = await read(subprocess)
      assert.notStrictEqual(result, filename1)
      await exec(`rm ${result}`)
    })

    it('encrypts directory', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'encrypt', dirname1 ])
      let result = await read(subprocess)
      assert.strictEqual(result, 'Enter password:')
      await write(subprocess, password)
      result = await read(subprocess)
      assert.strictEqual(result, dirname1)
    })

    it('encrypts directory and dirname', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'encrypt', '-r', dirname1 ])
      let result = await read(subprocess)
      assert.strictEqual(result, 'Enter password:')
      await write(subprocess, password)
      result = await read(subprocess)
      assert.notStrictEqual(result, dirname1)
      await exec(`rm -rf ${result}`)
    })

    it('errors when no path is passed', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'encrypt' ])
      const result = await read(subprocess)

      assert.strictEqual(result, [
        'Expected path to be a non-empty string\n',
        'Usage:  passworld <encrypt> [OPTIONS] PATH\n',
        'Options:',
        '  -g    do gzip compression before encryption',
        '  -r    encrypt the file/directory name(s)'
      ].join('\n'))
    })

    it('errors when no password is passed', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'encrypt', filename1 ])
      let result = await read(subprocess)
      assert.strictEqual(result, 'Enter password:')
      await write(subprocess, '\n')
      result = await read(subprocess)

      assert.strictEqual(result, [
        'Expected password to be a non-empty string\n',
        'Usage:  passworld <encrypt> [OPTIONS] PATH\n',
        'Options:',
        '  -g    do gzip compression before encryption',
        '  -r    encrypt the file/directory name(s)'
      ].join('\n'))
    })
  })

  describe('#decrypt({ rename: false })', () => {
    beforeEach(async () => {
      await passworld.encrypt(dirname1, password)
    })

    it('decrypts file', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'decrypt', filename1 ])
      let result = await read(subprocess)
      assert.strictEqual(result, 'Enter password:')
      await write(subprocess, password)
      result = await read(subprocess)
      assert.strictEqual(result, plaintext1.toString())
    })

    it('decrypts directory', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'decrypt', dirname1 ])
      let result = await read(subprocess)
      assert.strictEqual(result, 'Enter password:')
      await write(subprocess, password)
      result = await read(subprocess)
      assert.strictEqual(result, [
        'bar: secreting secrets so secretive',
        'baz/bam: levels'
      ].join('\n'))
    })

    it('errors when no path is passed', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'decrypt' ])
      const result = await read(subprocess)

      assert.strictEqual(result, [
        'Expected path to be a non-empty string\n',
        'Usage:  passworld <decrypt> [OPTIONS] PATH\n',
        'Options:',
        '  -g    do gzip decompression after decryption',
        '  -o    overwrite the file or directory',
        '  -r    decrypt the file/directory name(s)'
      ].join('\n'))
    })

    it('errors when no password is passed', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'decrypt', filename1 ])
      let result = await read(subprocess)
      assert.strictEqual(result, 'Enter password:')
      await write(subprocess, '\n')
      result = await read(subprocess)

      assert.strictEqual(result, [
        'Expected password to be a non-empty string\n',
        'Usage:  passworld <decrypt> [OPTIONS] PATH\n',
        'Options:',
        '  -g    do gzip decompression after decryption',
        '  -o    overwrite the file or directory',
        '  -r    decrypt the file/directory name(s)'
      ].join('\n'))
    })
  })

  describe('#decrypt({ rename: true })', () => {
    let dirname

    beforeEach(async () => {
      dirname = await passworld.encrypt(dirname1, password, { rename: true })
    })

    afterEach(async () => {
      await exec(`rm -rf ${dirname}`)
    })

    it('decrypts directory and dirname', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'decrypt', '-r', dirname ])
      let result = await read(subprocess)
      assert.strictEqual(result, 'Enter password:')
      await write(subprocess, password)
      result = await read(subprocess)
      assert.strictEqual(result, [
        'bar: secreting secrets so secretive',
        'baz/bam: levels'
      ].join('\n'))
    })
  })

  describe('#randcrypt()', () => {
    it('encrypts random data', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'randcrypt', filename1, length ])
      let result = await read(subprocess)
      assert.strictEqual(result, 'Enter password:')
      await write(subprocess, password)
      result = await read(subprocess)
      assert.strictEqual(result, filename1)
    })

    it('encrypts random data and dumps plaintext', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'randcrypt', '-d', filename1, length ])
      let result = await read(subprocess)
      assert.strictEqual(result, 'Enter password:')
      await write(subprocess, password)
      result = await read(subprocess)
      assert.strictEqual(result.length, 30)
    })

    it('errors when bad length is passed', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'randcrypt', filename1, '30.3' ])
      const result = await read(subprocess)

      assert.strictEqual(result, [
        'Expected length to be an integer > 0\n',
        'Usage:  passworld <randcrypt> [OPTIONS] PATH LENGTH\n',
        'Options:',
        '  -d    dump the generated plaintext to stdout',
        '  -g    do gzip compression before encryption',
        '  -r    encrypt the filename as well'
      ].join('\n'))
    })
  })
})

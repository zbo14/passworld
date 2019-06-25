'use strict'

const assert = require('assert')
const { promisify } = require('util')
const cp = require('child_process')
const exec = promisify(cp.exec)
const util = require('../lib/util')

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

describe('bin', function () {
  this.timeout(5e3)

  beforeEach(async () => {
    await exec([
      `mkdir ${dirname1} ${dirname2}`,
      `echo "${plaintext1}\\c" > ${filename1}`,
      `echo "${plaintext2}\\c" > ${filename2}`
    ].join(' && '))
  })

  afterEach(async () => {
    await exec(`rm -rf ${dirname1}{,.tar,.tgz}`)
  })

  it('handles unrecognized command', async () => {
    const subprocess = cp.spawn('node', [ 'bin', 'ecrypt' ])
    const result = await read(subprocess)
    assert.strictEqual(result, [
      'Usage:  passworld <command> [OPTIONS] ARGS\n',
      'Commands:',
      '  encrypt      Encrypt a file or directory',
      '  decrypt      Decrypt a file or directory'
    ].join('\n'))
  })

  describe('#encrypt()', () => {
    it('errors when no path is passed', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'encrypt' ])
      const result = await read(subprocess)

      assert.strictEqual(result, [
        'Expected path to be a non-empty string\n',
        'Usage:  passworld <encrypt> [OPTIONS] PATH\n',
        'Options:',
        '  -g    encrypt a gzipped tar archive'
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
        '  -g    encrypt a gzipped tar archive'
      ].join('\n'))
    })
  })

  describe('#decrypt()', () => {
    it('errors when no path is passed', async () => {
      const subprocess = cp.spawn('node', [ 'bin', 'decrypt' ])
      const result = await read(subprocess)

      assert.strictEqual(result, [
        'Expected path to be a non-empty string\n',
        'Usage:  passworld <decrypt> PATH'
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
        'Usage:  passworld <decrypt> PATH'
      ].join('\n'))
    })
  })

  describe('#encrypt() and then #decrypt()', () => {
    it('encrypts and then decrypts file', async () => {
      {
        const subprocess = cp.spawn('node', [ 'bin', 'encrypt', filename1 ])
        const result = await read(subprocess)
        assert.strictEqual(result, 'Enter password:')
        await write(subprocess, password)
        await read(subprocess)
      }

      {
        const subprocess = cp.spawn('node', [ 'bin', 'decrypt', filename1 ])
        const result = await read(subprocess)
        assert.strictEqual(result, 'Enter password:')
        await write(subprocess, password)
        await read(subprocess)
      }

      const result = await util.readFile(filename1)
      assert.deepStrictEqual(result, plaintext1)
    })

    it('encrypts and then decrypts directory', async () => {
      {
        const subprocess = cp.spawn('node', [ 'bin', 'encrypt', dirname1 ])
        const result = await read(subprocess)
        assert.strictEqual(result, 'Enter password:')
        await write(subprocess, password)
        await read(subprocess)
      }

      {
        const subprocess = cp.spawn('node', [ 'bin', 'decrypt', dirname1 + '.tar' ])
        const result = await read(subprocess)
        assert.strictEqual(result, 'Enter password:')
        await write(subprocess, password)
        await read(subprocess)
      }

      assert.deepStrictEqual(await util.readdir(dirname1), [ 'bar', 'baz' ])
      assert.deepStrictEqual(await util.readdir(dirname2), [ 'bam' ])
      assert.deepStrictEqual(await util.readFile(filename1), plaintext1)
      assert.deepStrictEqual(await util.readFile(filename2), plaintext2)
    })

    it('compresses and encrypts and then decrypts and decompresses directory', async () => {
      {
        const subprocess = cp.spawn('node', [ 'bin', 'encrypt', '-g', dirname1 ])
        const result = await read(subprocess)
        assert.strictEqual(result, 'Enter password:')
        await write(subprocess, password)
        await read(subprocess)
      }

      {
        const subprocess = cp.spawn('node', [ 'bin', 'decrypt', dirname1 + '.tgz' ])
        const result = await read(subprocess)
        assert.strictEqual(result, 'Enter password:')
        await write(subprocess, password)
        await read(subprocess)
      }

      assert.deepStrictEqual(await util.readdir(dirname1), [ 'bar', 'baz' ])
      assert.deepStrictEqual(await util.readdir(dirname2), [ 'bam' ])
      assert.deepStrictEqual(await util.readFile(filename1), plaintext1)
      assert.deepStrictEqual(await util.readFile(filename2), plaintext2)
    })
  })
})

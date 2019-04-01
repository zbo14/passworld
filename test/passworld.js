'use strict'

const assert = require('assert')
const { promisify } = require('util')
const exec = promisify(require('child_process').exec)
const readFile = promisify(require('fs').readFile)
const passworld = require('../lib')

const dirname = '/tmp/foo'
const filename = `${dirname}/bar`
const password = 'oogly boogly'
const plaintext = 'secreting secrets so secretive'
const length = 30

describe('passworld', function () {
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
      await exec(`rm -r ${dirname}`)
    })

    it('encrypts file', async () => {
      const result = await passworld.encrypt(filename, password)
      assert.strictEqual(result, 'Encrypted file!')
    })

    it('fails to encrypt file that doesn\'t exist', async () => {
      try {
        await passworld.encrypt('/tmp/foobar', password)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Couldn\'t read file, check the filename')
      }
    })

    it('recursively encrypts contents of directory', async () => {
      let result = await passworld.encrypt(dirname, password)
      assert.strictEqual(result, 'Encrypted directory!')

      result = await readFile(filename, 'utf8')
      assert.notStrictEqual(result.trim(), plaintext)

      result = await readFile(dirname + '/baz/bam', 'utf8')
      assert.notStrictEqual(result.trim(), 'levels')
    })
  })

  describe('#randcrypt()', () => {
    beforeEach(async () => {
      await exec(`mkdir ${dirname}`)
    })

    afterEach(async () => {
      await exec(`rm -r ${dirname}`)
    })

    it('encrypts random data', async () => {
      const result = await passworld.randcrypt(filename, password, length)
      assert.strictEqual(result, 'Encrypted random data!')
    })

    it('encrypts random data and dumps generated plaintext', async () => {
      const result = await passworld.randcrypt(filename, password, length, true)
      const buf = Buffer.from(result, 'base64')
      assert.strictEqual(buf.byteLength, length)
    })

    it('fails to encrypt random data when write fails', async () => {
      try {
        await passworld.randcrypt(dirname, password, length)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Couldn\'t write file, check the filename')
      }
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

      await passworld.encrypt(dirname, password)
    })

    afterEach(async () => {
      await exec(`rm -r ${dirname}`)
    })

    it('decrypts file', async () => {
      const result = await passworld.decrypt(filename, password)
      assert.strictEqual(result, plaintext)
    })

    it('fails to decrypt file that doesn\'t exist', async () => {
      try {
        await passworld.decrypt('/tmp/foobar', password)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Couldn\'t read file, check the filename')
      }
    })

    it('fails to decrypt file with wrong password', async () => {
      try {
        await passworld.decrypt(filename, 'wrongpassword')
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Decryption failed')
      }
    })

    it('decrypts and overwrites file', async () => {
      const result = await passworld.decrypt(filename, password, true)
      assert.strictEqual(result, 'Decrypted file!')
      const { stdout } = await exec(`cat ${filename}`)
      assert.strictEqual(stdout.trim(), plaintext)
    })

    it('recursively decrypts contents of directory', async () => {
      let result = await passworld.decrypt(dirname, password)
      assert.strictEqual(result, 'Decrypted directory!')

      result = await readFile(filename, 'utf8')
      assert.strictEqual(result.trim(), plaintext)

      result = await readFile(dirname + '/baz/bam', 'utf8')
      assert.strictEqual(result.trim(), 'levels')
    })

    it('fails to recursively decrypt contents of directory multiple times', async () => {
      await passworld.decrypt(dirname, password)

      try {
        await passworld.decrypt(dirname, password)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Invalid description')
      }

      let result = await readFile(filename, 'utf8')
      assert.strictEqual(result.trim(), plaintext)

      result = await readFile(dirname + '/baz/bam', 'utf8')
      assert.strictEqual(result.trim(), 'levels')
    })
  })
})

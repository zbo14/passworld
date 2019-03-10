'use strict'

const assert = require('assert')
const { promisify } = require('util')
const exec = promisify(require('child_process').exec)
const { shouldThrow } = require('./fixtures')
const passworld = require('../lib')

const filename = '/tmp/foobar'
const password = 'oogly boogly'
const plaintext = 'secreting secrets so secretive'
const length = 30

describe('passworld', function () {
  describe('#encrypt()', () => {
    before(async () => {
      await exec(`echo "${plaintext}" > ${filename}`)
    })

    after(async () => {
      await exec(`rm ${filename}`)
    })

    it('encrypts file', async () => {
      const result = await passworld.encrypt(filename, password)
      assert.strictEqual(result, 'Successfully encrypted file!')
    })

    it('fails to create file that doesn\'t exist', async () => {
      try {
        await passworld.encrypt('/tmp/foo/bar', password)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'File not found')
      }
    })
  })

  describe('#randcrypt()', () => {
    after(async () => {
      await exec(`rm ${filename}`)
    })

    it('encrypts random data', async () => {
      const result = await passworld.randcrypt(filename, password, length)
      assert.strictEqual(result, 'Successfully encrypted random data!')
    })
  })

  describe('#encrypt()', () => {
    before(async () => {
      await exec(`echo "${plaintext}" > ${filename}`)
      await passworld.encrypt(filename, password)
    })

    after(async () => {
      await exec(`rm ${filename}`)
    })

    it('descrypts file', async () => {
      const result = await passworld.decrypt(filename, password)
      assert.strictEqual(result, plaintext)
    })

    it('fails to decrypt file with wrong password', async () => {
      try {
        await passworld.decrypt(filename, 'wrongpassword')
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Decryption failed')
      }
    })
  })
})

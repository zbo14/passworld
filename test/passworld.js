'use strict'

const assert = require('assert')
const { promisify } = require('util')
const exec = promisify(require('child_process').exec)
const passworld = require('../lib')

const dirname = '/tmp/foo'
const filename = `${dirname}/bar`
const password = 'oogly boogly'
const plaintext = 'secreting secrets so secretive'
const length = 30

describe('passworld', function () {
  describe('#encrypt()', () => {
    before(async () => {
      await exec(`mkdir ${dirname} && echo "${plaintext}" > ${filename}`)
    })

    after(async () => {
      await exec(`rm -r ${dirname}`)
    })

    it('encrypts file', async () => {
      const result = await passworld.encrypt(filename, password)
      assert.strictEqual(result, 'Encrypted file!')
    })

    it('fails to encrypt file when validation fails', async () => {
      try {
        await passworld.encrypt(filename, '')
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Expected password to be a non-empty string\n\nUsage:  passworld <encrypt> FILENAME')
      }
    })

    it('fails to encrypt file that doesn\'t exist', async () => {
      try {
        await passworld.encrypt('/tmp/foobar', password)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Couldn\'t read file, check the filename')
      }
    })
  })

  describe('#randcrypt()', () => {
    before(async () => {
      await exec(`mkdir ${dirname}`)
    })

    after(async () => {
      await exec(`rm -r ${dirname}`)
    })

    it('encrypts random data', async () => {
      const result = await passworld.randcrypt(filename, password, length)
      assert.strictEqual(result, 'Encrypted random data!')
    })

    it('fails to encrypt random data when validation fails', async () => {
      try {
        await passworld.randcrypt(filename, password, 20.2)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Expected length to be an integer > 0\n\nUsage:  passworld <randcrypt> FILENAME LENGTH')
      }
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
    before(async () => {
      await exec(`mkdir ${dirname} && echo "${plaintext}" > ${filename}`)
      await passworld.encrypt(filename, password)
    })

    after(async () => {
      await exec(`rm -r ${dirname}`)
    })

    it('decrypts file', async () => {
      const result = await passworld.decrypt(filename, password)
      assert.strictEqual(result, plaintext)
    })

    it('fails to decrypt file when validation fails', async () => {
      try {
        await passworld.decrypt('', password)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Expected filename to be a non-empty string\n\nUsage:  passworld <decrypt> FILENAME [OVERWRITE]')
      }
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
      const result = await passworld.decrypt(filename, password, 'yes')
      assert.strictEqual(result, 'Decrypted file!')
      const { stdout } = await exec(`cat ${filename}`)
      assert.strictEqual(stdout.trim(), plaintext)
    })
  })
})

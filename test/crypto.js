'use strict'

const assert = require('assert')
const { shouldThrow } = require('./fixtures')
const crypto = require('../lib/crypto')
const util = require('../lib/util')

const password = 'baz bam'
const plaintext = 'foobar'

describe('crypto', () => {
  describe('#encrypt()', () => {
    it('encrypts a string with a password', async () => {
      const description = await crypto.encrypt(plaintext, password)
      assert.strictEqual(typeof description, 'string')
    })
  })

  describe('#decrypt()', () => {
    before(async () => {
      this.description = await crypto.encrypt(plaintext, password)
      this.descObj = util.deserialize(this.description)
    })

    it('decrypts the data with a password string', async () => {
      const result = await crypto.decrypt(this.description, password)
      assert.strictEqual(result.toString(), plaintext)
    })

    it('fails to decrypt invalid description', async () => {
      const newDescription = Buffer.from(this.description, 'base64').toString('hex')

      try {
        await crypto.decrypt(newDescription, password)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Invalid description')
      }
    })

    it('fails to decrypt with wrong password', async () => {
      const password = Buffer.from('bar')

      try {
        await crypto.decrypt(this.description, password)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Decryption failed')
      }
    })

    it('fails to decrypt with tampered ciphertext', async () => {
      const newDescObj = { ...this.descObj }
      newDescObj.ciphertext[3]--
      const newDescription = util.serialize(newDescObj)

      try {
        await crypto.decrypt(newDescription, password)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Decryption failed')
      }
    })

    it('fails to decrypt with wrong salt1', async () => {
      const newDescObj = { ...this.descObj }
      newDescObj.salt[4]++
      const newDescription = util.serialize(newDescObj)

      try {
        await crypto.decrypt(newDescription, password)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Decryption failed')
      }
    })
  })
})
'use strict'

const assert = require('assert')
const crypto = require('../../lib/crypto')
const util = require('../../lib/util')

const password = 'baz bam'
const plaintext = Buffer.from('foobar')

describe('lib/crypto', () => {
  describe('#encrypt()', () => {
    it('encrypts a string with a password', async () => {
      const bundle = await crypto.encrypt(plaintext, password)
      assert.strictEqual(typeof bundle, 'string')
    })
  })

  describe('#decrypt()', () => {
    beforeEach(async () => {
      this.bundleStr = await crypto.encrypt(plaintext, password)
      this.bundleObj = util.deserialize(this.bundleStr)
    })

    it('decrypts the data with a password string', async () => {
      const result = await crypto.decrypt(this.bundleStr, password)
      assert(Buffer.isBuffer(result))
      assert(result.equals(plaintext))
    })

    it('fails to decrypt invalid bundle', async () => {
      const newbundle = Buffer.from(this.bundleStr, 'base64').toString('hex')

      try {
        await crypto.decrypt(newbundle, password)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Invalid bundle')
      }
    })

    it('fails to decrypt with wrong password', async () => {
      const password = Buffer.from('bar')

      try {
        await crypto.decrypt(this.bundleStr, password)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Decryption failed')
      }
    })

    it('fails to decrypt with tampered ciphertext', async () => {
      this.bundleObj.ciphertext[3]--
      const bundleStr = util.serialize(this.bundleObj)

      try {
        await crypto.decrypt(bundleStr, password)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Decryption failed')
      }
    })

    it('fails to decrypt with wrong salt1', async () => {
      this.bundleObj.salt1[4]++
      const bundleStr = util.serialize(this.bundleObj)

      try {
        await crypto.decrypt(bundleStr, password)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Decryption failed')
      }
    })

    it('fails to decrypt with wrong nonce1', async () => {
      this.bundleObj.nonce1[4]++
      const bundleStr = util.serialize(this.bundleObj)

      try {
        await crypto.decrypt(bundleStr, password)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Decryption failed')
      }
    })

    it('fails to decrypt with wrong salt2', async () => {
      this.bundleObj.salt2[4]++
      const bundleStr = util.serialize(this.bundleObj)

      try {
        await crypto.decrypt(bundleStr, password)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Decryption failed')
      }
    })

    it('fails to decrypt with wrong nonce2', async () => {
      this.bundleObj.nonce2[4]++
      const bundleStr = util.serialize(this.bundleObj)

      try {
        await crypto.decrypt(bundleStr, password)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Decryption failed')
      }
    })
  })
})

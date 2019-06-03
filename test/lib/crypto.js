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

    it('compresses then encrypts the string', async () => {
      const bundle = await crypto.encrypt(plaintext, password, { gzip: true })
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

    it('decrypts and then decompresses the data', async () => {
      const bundle = await crypto.encrypt(plaintext, password, { gzip: true })
      const result = await crypto.decrypt(bundle, password, { gunzip: true })
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

    it('fails to decrypt with wrong salt', async () => {
      this.bundleObj.salt[4]++
      const bundleStr = util.serialize(this.bundleObj)

      try {
        await crypto.decrypt(bundleStr, password)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Decryption failed')
      }
    })

    it('fails to decrypt with wrong nonce', async () => {
      this.bundleObj.nonce[4]++
      const bundleStr = util.serialize(this.bundleObj)

      try {
        await crypto.decrypt(bundleStr, password)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Decryption failed')
      }
    })

    it('fails to decompress after decryption', async () => {
      try {
        await crypto.decrypt(this.bundleStr, password, { gunzip: true })
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Decompression failed')
      }
    })
  })
})

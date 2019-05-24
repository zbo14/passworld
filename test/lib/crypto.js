'use strict'

const assert = require('assert')
const crypto = require('../../lib/crypto')
const util = require('../../lib/util')

const password = 'baz bam'
const plaintext = Buffer.from('foobar')

describe('lib/crypto', () => {
  describe('#encrypt()', () => {
    it('encrypts a string with a password', async () => {
      const description = await crypto.encrypt(plaintext, password)
      assert.strictEqual(typeof description, 'string')
    })

    it('compresses then encrypts the string', async () => {
      const description = await crypto.encrypt(plaintext, password, { gzip: true })
      assert.strictEqual(typeof description, 'string')
    })
  })

  describe('#decrypt()', () => {
    beforeEach(async () => {
      this.descStr = await crypto.encrypt(plaintext, password)
      this.descObj = util.deserialize(this.descStr)
    })

    it('decrypts the data with a password string', async () => {
      const result = await crypto.decrypt(this.descStr, password)
      assert(Buffer.isBuffer(result))
      assert(result.equals(plaintext))
    })

    it('decrypts and then decompresses the data', async () => {
      const description = await crypto.encrypt(plaintext, password, { gzip: true })
      const result = await crypto.decrypt(description, password, { gunzip: true })
      assert(Buffer.isBuffer(result))
      assert(result.equals(plaintext))
    })

    it('fails to decrypt invalid description', async () => {
      const newDescription = Buffer.from(this.descStr, 'base64').toString('hex')

      try {
        await crypto.decrypt(newDescription, password)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Invalid description')
      }
    })

    it('fails to decrypt with wrong password', async () => {
      const password = Buffer.from('bar')

      try {
        await crypto.decrypt(this.descStr, password)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Decryption failed')
      }
    })

    it('fails to decrypt with tampered ciphertext', async () => {
      this.descObj.ciphertext[3]--
      const descStr = util.serialize(this.descObj)

      try {
        await crypto.decrypt(descStr, password)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Decryption failed')
      }
    })

    it('fails to decrypt with wrong salt', async () => {
      this.descObj.salt[4]++
      const descStr = util.serialize(this.descObj)

      try {
        await crypto.decrypt(descStr, password)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Decryption failed')
      }
    })

    it('fails to decrypt with wrong nonce', async () => {
      this.descObj.nonce[4]++
      const descStr = util.serialize(this.descObj)

      try {
        await crypto.decrypt(descStr, password)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Decryption failed')
      }
    })

    it('fails to decompress after decryption', async () => {
      try {
        await crypto.decrypt(this.descStr, password, { gunzip: true })
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Decompression failed')
      }
    })
  })
})

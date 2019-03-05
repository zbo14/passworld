'use strict'

const assert = require('assert')
const { shouldThrow } = require('./fixtures')
const recrypt = require('../lib/recrypt')
const util = require('../lib/util')

const plaintext = 'foobar'
const passphrase = 'baz bam'

describe('recrypt', () => {
  describe('#encrypt()', () => {
    it('encrypts a plaintext string with a passphrase', async () => {
      const description = await recrypt.encrypt(plaintext, passphrase)
      assert.strictEqual(typeof description, 'string')
    })

    it('encrypts a plaintext buffer with a passphrase', async () => {
      const description = await recrypt.encrypt(Buffer.from(plaintext), passphrase)
      assert.strictEqual(typeof description, 'string')
    })
  })

  describe('#decrypt()', () => {
    before(async () => {
      this.description = await recrypt.encrypt(plaintext, passphrase)
      this.descObj = util.deserialize(this.description)
    })

    it('decrypts the plaintext with a passphrase string', async () => {
      const result = await recrypt.decrypt(this.description, passphrase)
      assert.strictEqual(result.toString(), plaintext)
    })

    it('decrypts the plaintext with a passphrase buffer and encodes it', async () => {
      const result = await recrypt.decrypt(this.description, passphrase, 'utf8')
      assert.strictEqual(result, plaintext)
    })

    it('fails to decrypt invalid description', async () => {
      const newDescription = Buffer.from(this.description, 'base64').toString('hex')

      try {
        await recrypt.decrypt(newDescription, passphrase)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Invalid description')
      }
    })

    it('fails to decrypt with wrong passphrase', async () => {
      const passphrase = Buffer.from('bar')

      try {
        await recrypt.decrypt(this.description, passphrase)
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
        await recrypt.decrypt(newDescription, passphrase)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Decryption failed')
      }
    })

    it('fails to decrypt with wrong salt1', async () => {
      const newDescObj = { ...this.descObj }
      newDescObj.salt1[4]++
      const newDescription = util.serialize(newDescObj)

      try {
        await recrypt.decrypt(newDescription, passphrase)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Decryption failed')
      }
    })

    it('fails to decrypt with wrong salt2', async () => {
      const newDescObj = { ...this.descObj }
      newDescObj.salt2[5]--
      const newDescription = util.serialize(newDescObj)

      try {
        await recrypt.decrypt(newDescription, passphrase)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Decryption failed')
      }
    })
  })
})

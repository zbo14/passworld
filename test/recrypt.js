'use strict'

const assert = require('assert')
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
    let description
    let descObj

    before(async () => {
      description = await recrypt.encrypt(plaintext, passphrase)
      descObj = util.deserialize(description)
    })

    it('decrypts the plaintext with a passphrase string', async () => {
      const result = await recrypt.decrypt(description, passphrase)
      assert.strictEqual(result.toString(), plaintext)
    })

    it('decrypts the plaintext with a passphrase buffer and encodes it', async () => {
      const result = await recrypt.decrypt(description, passphrase, 'utf8')
      assert.strictEqual(result, plaintext)
    })

    it('fails to decrypt invalid description', async () => {
      const newDescription = Buffer.from(description, 'base64').toString('hex')

      try {
        await recrypt.decrypt(newDescription, passphrase)
        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(err.message, 'Invalid description')
      }
    })

    it('fails to decrypt with wrong passphrase', async () => {
      const passphrase = Buffer.from('bar')

      try {
        await recrypt.decrypt(description, passphrase)
        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(err.message, 'Decryption failed')
      }
    })

    it('fails to decrypt with tampered ciphertext', async () => {
      const newDescObj = { ...descObj }
      newDescObj.ciphertext[3]--
      const newDescription = util.serialize(newDescObj)

      try {
        await recrypt.decrypt(newDescription, passphrase)
        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(err.message, 'Decryption failed')
      }
    })

    it('fails to decrypt with wrong salt1', async () => {
      const newDescObj = { ...descObj }
      newDescObj.salt1[4]++
      const newDescription = util.serialize(newDescObj)

      try {
        await recrypt.decrypt(newDescription, passphrase)
        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(err.message, 'Decryption failed')
      }
    })

    it('fails to decrypt with wrong salt2', async () => {
      const newDescObj = { ...descObj }
      newDescObj.salt2[5]--
      const newDescription = util.serialize(newDescObj)

      try {
        await recrypt.decrypt(newDescription, passphrase)
        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(err.message, 'Decryption failed')
      }
    })
  })
})

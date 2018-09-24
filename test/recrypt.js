'use strict'

/* eslint-env mocha */

const assert = require('assert')
const recrypt = require('../lib/recrypt')
const util = require('../lib/util')

const plaintext = 'foobar'
const password = 'baz'

describe('recrypt', () => {
  describe('#encrypt()', () => {
    it('encrypts a plaintext string with a password', async () => {
      const description = await recrypt.encrypt(plaintext, password)
      assert.strictEqual(typeof description, 'string')
    })

    it('encrypts a plaintext buffer with a password', async () => {
      const description = await recrypt.encrypt(Buffer.from(plaintext), password)
      assert.strictEqual(typeof description, 'string')
    })
  })

  describe('#decrypt()', () => {
    let description
    let descObj

    before(async () => {
      description = await recrypt.encrypt(plaintext, password)
      descObj = util.deserialize(description)
    })

    it('decrypts the plaintext with a password string', async () => {
      const result = await recrypt.decrypt(description, password)
      assert.strictEqual(result.toString(), plaintext)
    })

    it('decrypts the plaintext with a password buffer and encodes it', async () => {
      const result = await recrypt.decrypt(description, password, 'utf8')
      assert.strictEqual(result, plaintext)
    })

    it('fails to decrypt invalid description', async () => {
      const newDescription = Buffer.from(description, 'base64').toString('hex')

      try {
        await recrypt.decrypt(newDescription, password)
        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(err.message, 'Invalid description')
      }
    })

    it('fails to decrypt with wrong password', async () => {
      const password = Buffer.from('bar')

      try {
        await recrypt.decrypt(description, password)
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
        await recrypt.decrypt(newDescription, password)
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
        await recrypt.decrypt(newDescription, password)
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
        await recrypt.decrypt(newDescription, password)
        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(err.message, 'Decryption failed')
      }
    })
  })
})

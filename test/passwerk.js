'use strict'

const assert = require('assert')
const { shouldThrow } = require('./fixtures')
const passwerk = require('../lib')

const service = 'foobar'
const passphrase = 'oogly boogly'
const length = 20
const newPassphrase = 'ooglyboogly'

describe('passwerk', function () {
  this.timeout(5e3)

  describe('#create()', () => {
    after(async () => {
      await passwerk.delete(service, passphrase)
    })

    it('create password for a service', async () => {
      const result = await passwerk.create(service, passphrase, length)
      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result.length, length)
    })

    it('creates password with different length for another service', async () => {
      const result = await passwerk.create('foobam', passphrase, 30)
      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result.length, 30)
    })

    it('fails to create password for service that already exists', async () => {
      try {
        await passwerk.create(service, passphrase, length)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, `Password already exists for service '${service}'`)
      }
    })
  })

  describe('#read()', () => {
    before(async () => {
      this.password = await passwerk.create(service, passphrase, length)
    })

    after(async () => {
      await passwerk.delete(service, passphrase)
    })

    it('reads password for service', async () => {
      const result = await passwerk.read(service, passphrase)
      assert.strictEqual(result, this.password)
    })

    it('fails to read password that doesn\'t exist', async () => {
      try {
        await passwerk.read('foobaz', passphrase)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'No password for service \'foobaz\'')
      }
    })
  })

  describe('#update()', () => {
    before(async () => {
      await passwerk.create(service, passphrase, length)
    })

    after(async () => {
      await passwerk.delete(service, newPassphrase)
    })

    it('fails to update the password', async () => {
      try {
        await passwerk.update(service, newPassphrase, length)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Invalid passphrase: cannot update password')
      }
    })

    it('fails to update a password that doesn\'t exist', async () => {
      try {
        await passwerk.update('foobaz', newPassphrase, length)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'No password for service \'foobaz\'')
      }
    })

    it('updates the password with the same passphrase', async () => {
      let result = await passwerk.update(service, passphrase, length)
      assert.strictEqual(typeof result, 'string')
      result = await passwerk.read(service, passphrase, length)
      assert.strictEqual(typeof result, 'string')
    })

    it('updates the password with a different passphrase', async () => {
      let result = await passwerk.update(service, passphrase, length, newPassphrase)
      assert.strictEqual(typeof result, 'string')
      result = await passwerk.read(service, newPassphrase, length)
      assert.strictEqual(typeof result, 'string')
    })
  })

  describe('#delete()', () => {
    before(async () => {
      await passwerk.create(service, passphrase, length)
    })

    after(async () => {
      await passwerk.delete(service, passphrase)
    })

    it('fails to delete a password that doesn\'t exist', async () => {
      try {
        await passwerk.delete('foobaz', passphrase)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'No password for service \'foobaz\'')
      }
    })

    it('fails to delete a password with invalid passphrase', async () => {
      try {
        await passwerk.delete(service, newPassphrase)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Invalid passphrase: cannot delete password')
      }
    })
  })
})

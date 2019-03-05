'use strict'

const assert = require('assert')
const { promisify } = require('util')
const exec = promisify(require('child_process').exec)
const { shouldThrow } = require('./fixtures')
const passworld = require('../lib')

const service = 'foobar'
const passphrase = 'oogly boogly'
const length = 20
const newPassphrase = 'ooglyboogly'

describe('passworld', function () {
  this.timeout(5e3)

  describe('#open()', () => {
    before(async () => {
      await exec('echo \'{"foobar":"baz"}\' > /tmp/passwords')
    })

    after(async () => {
      await passworld.save('/tmp/passwords')
      await exec('rm /tmp/passwords')
    })

    it('throws if file with file doesn\'t exist', async () => {
      try {
        await passworld.open('tmp/cantfindme')
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Cannot open file')
      }
    })

    it('doesn\'t throw when file doesn\'t exist but init is truthy', async () => {
      const result = await passworld.open('tmp/cantfindme2', true)
      assert.strictEqual(result, false)
    })

    it('opens file', async () => {
      const result = await passworld.open('/tmp/passwords', true)
      assert.strictEqual(result, true)
    })
  })

  describe('#create()', () => {
    after(async () => {
      await passworld.delete(service, passphrase)
    })

    it('create password for a service', async () => {
      const result = await passworld.create(service, passphrase, length)
      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result.length, length)
    })

    it('creates password with different length for another service', async () => {
      const result = await passworld.create('foobam', passphrase, 30)
      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result.length, 30)
    })

    it('fails to create password for service that already exists', async () => {
      try {
        await passworld.create(service, passphrase, length)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, `Password already exists for service '${service}'`)
      }
    })
  })

  describe('#read()', () => {
    before(async () => {
      this.password = await passworld.create(service, passphrase, length)
    })

    after(async () => {
      await passworld.delete(service, passphrase)
    })

    it('reads password for service', async () => {
      const result = await passworld.read(service, passphrase)
      assert.strictEqual(result, this.password)
    })

    it('fails to read password that doesn\'t exist', async () => {
      try {
        await passworld.read('foobaz', passphrase)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'No password for service \'foobaz\'')
      }
    })
  })

  describe('#update()', () => {
    before(async () => {
      await passworld.create(service, passphrase, length)
    })

    after(async () => {
      await passworld.delete(service, newPassphrase)
    })

    it('fails to update the password', async () => {
      try {
        await passworld.update(service, newPassphrase, length)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Invalid passphrase: cannot update password')
      }
    })

    it('fails to update a password that doesn\'t exist', async () => {
      try {
        await passworld.update('foobaz', newPassphrase, length)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'No password for service \'foobaz\'')
      }
    })

    it('updates the password with the same passphrase', async () => {
      let result = await passworld.update(service, passphrase, length)
      assert.strictEqual(typeof result, 'string')
      result = await passworld.read(service, passphrase, length)
      assert.strictEqual(typeof result, 'string')
    })

    it('updates the password with a different passphrase', async () => {
      let result = await passworld.update(service, passphrase, length, newPassphrase)
      assert.strictEqual(typeof result, 'string')
      result = await passworld.read(service, newPassphrase, length)
      assert.strictEqual(typeof result, 'string')
    })
  })

  describe('#delete()', () => {
    before(async () => {
      await passworld.create(service, passphrase, length)
    })

    after(async () => {
      await passworld.delete(service, passphrase)
    })

    it('fails to delete a password that doesn\'t exist', async () => {
      try {
        await passworld.delete('foobaz', passphrase)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'No password for service \'foobaz\'')
      }
    })

    it('fails to delete a password with invalid passphrase', async () => {
      try {
        await passworld.delete(service, newPassphrase)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Invalid passphrase: cannot delete password')
      }
    })
  })
})

'use strict'

const assert = require('assert')
const { promisify } = require('util')
const exec = promisify(require('child_process').exec)
const passwerk = require('../lib/passwerk')

const passphrase = 'oogly boogly'
const service = 'facebook'
const length = 20

describe('passwerk', () => {
  describe('#create()', () => {
    before(async () => {
      await exec('mkdir -p passwerds')
    })

    after(async () => {
      await exec('rm -rf passwerds')
    })

    it('create password for a service', async () => {
      const result = await passwerk.create({ service, passphrase, length })
      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result.length, length)
    })

    it('creates password with different length for another service', async () => {
      const result = await passwerk.create({
        service: 'gmail',
        passphrase,
        length: 30
      })

      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result.length, 30)
    })

    it('fails to create password for service that already exists', async () => {
      try {
        await passwerk.create({ service, passphrase, length })
        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(
          err.message,
          `Password already exists for service: ${service}`
        )
      }
    })
  })

  describe('#update()', () => {
    before(async () => {
      await exec('mkdir -p passwerds')
      await passwerk.create({ service, passphrase, length })
    })

    after(async () => {
      await exec('rm -rf passwerds')
    })

    it('fails to reset the password', async () => {
      try {
        await passwerk.update({
          service,
          passphrase: 'ooglyboogly',
          length
        })

        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(
          err.message,
          'Invalid passphrase: cannot reset password'
        )
      }
    })

    it('fails to reset a password that doesn\'t exist', async () => {
      try {
        await passwerk.update({
          service: 'aol',
          passphrase: 'ooglyboogly',
          length
        })

        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(
          err.message,
          'No password for service: aol'
        )
      }
    })

    it('resets the password with the same passphrase', async () => {
      let result = await passwerk.update({ service, passphrase, length })
      assert.strictEqual(typeof result, 'string')
      result = await passwerk.get({ service, passphrase, length })
      assert.strictEqual(typeof result, 'string')
    }).timeout(5e3)

    it('resets the password with a different passphrase', async () => {
      let result = await passwerk.update({
        service,
        passphrase,
        newPassphrase: 'foo bar baz',
        length
      })

      assert.strictEqual(typeof result, 'string')
      result = await passwerk.get({ service, passphrase: 'foo bar baz', length })
      assert.strictEqual(typeof result, 'string')
    }).timeout(5e3)
  })

  describe('#get()', () => {
    let password

    before(async () => {
      await exec('mkdir -p passwerds')
      password = await passwerk.create({ service, passphrase, length })
    })

    after(async () => {
      await exec('rm -rf passwerds')
    })

    it('gets password for service', async () => {
      const result = await passwerk.get({ service, passphrase, length })
      assert.strictEqual(result, password)
    })

    it('fails to get password that doesn\'t exist', async () => {
      try {
        await passwerk.get({
          service: 'twitter',
          passphrase,
          length
        })

        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(err.message, 'No password for service: twitter')
      }
    })
  })
})

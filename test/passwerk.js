'use strict'

const assert = require('assert')
const { promisify } = require('util')
const exec = promisify(require('child_process').exec)
const passwerk = require('../lib/passwerk')

const passphrase = 'oogly boogly'
const service = 'facebook'
const length = 20

describe('passwerk', () => {
  describe('#set()', () => {
    before(async () => {
      await exec('mkdir -p passwords')
    })

    after(async () => {
      await exec('rm -rf passwords')
    })

    it('sets password for a service', async () => {
      const result = await passwerk.set({ service, passphrase, length })
      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result.length, length)
    })

    it('sets password with different length for another service', async () => {
      const result = await passwerk.set({
        service: 'gmail',
        passphrase,
        length: 32
      })

      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result.length, 32)
    })

    it('fails to reset the password', async () => {
      try {
        await passwerk.set({
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

    it('resets the password with the same passphrase', async () => {
      let result = await passwerk.set({ service, passphrase, length })
      assert.strictEqual(typeof result, 'string')
      result = await passwerk.get({ service, passphrase, length })
      assert.strictEqual(typeof result, 'string')
    }).timeout(5e3)

    it('resets the password with a different passphrase', async () => {
      let result = await passwerk.set({
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
      await exec('mkdir -p passwords')
      password = await passwerk.set({ service, passphrase, length })
    })

    after(async () => {
      await exec('rm -rf passwords')
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

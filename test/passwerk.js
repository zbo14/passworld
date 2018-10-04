'use strict'

/* eslint-env mocha */

const assert = require('assert')
const { promisify } = require('util')
const exec = promisify(require('child_process').exec)
const passwerk = require('../lib/passwerk')

const passphrase = 'oogly boogly'
const service = 'facebook'

describe('passwerk', () => {
  describe('#set()', () => {
    before(async () => {
      await exec('rm -rf passwerds && mkdir passwerds')
    })

    it('sets password for a service', async () => {
      const result = await passwerk.set(service, passphrase)
      assert.strictEqual(typeof result, 'string')
    })

    it('fails to reset the password', async () => {
      try {
        await passwerk.set(service, 'ooglyboogly')
        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(
          err.message,
          'Invalid passphrase: cannot reset password'
        )
      }
    })

    it('resets the password with the same passphrase', async () => {
      let result = await passwerk.set(service, passphrase)
      assert.strictEqual(typeof result, 'string')
      result = await passwerk.get(service, passphrase)
      assert.strictEqual(typeof result, 'string')
    }).timeout(3e3)

    it('resets the password with a different passphrase', async () => {
      let result = await passwerk.set(service, passphrase, 'foo bar baz')
      assert.strictEqual(typeof result, 'string')
      result = await passwerk.get(service, 'foo bar baz')
      assert.strictEqual(typeof result, 'string')
    }).timeout(3e3)
  })

  describe('#get()', () => {
    let password

    before(async () => {
      await exec('rm -rf passwerds && mkdir passwerds')
      password = await passwerk.set(service, passphrase)
    })

    it('gets password for service', async () => {
      const result = await passwerk.get(service, passphrase)
      assert.strictEqual(result, password)
    })

    it('fails to get password that doesn\'t exist', async () => {
      try {
        await passwerk.get('twitter', passphrase)
        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(err.message, 'No password for service: twitter')
      }
    })
  })
})

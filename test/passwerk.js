'use strict'

/* eslint-env mocha */

const assert = require('assert')
const { exec } = require('child_process')
const passwerk = require('../lib/passwerk')

const password = 'ooglyboogly'
const service = 'facebook'

describe('passwerk', () => {
  before(done => exec('rm -rf passwerds && mkdir passwerds', done))

  describe('#get()', () => {
    it('fails to get password that doesn\'t exist yet', async () => {
      try {
        await passwerk.get(service, password)
        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(err.message, 'No password for service: facebook')
      }
    })
  })

  describe('#set()', () => {
    it('sets password for a service', async () => {
      const result = await passwerk.set(service, password)
      assert.strictEqual(typeof result, 'string')
    })
  })

  describe('#get()', () => {
    let passwerd

    before(async () => {
      passwerd = await passwerk.set(service, password)
    })

    it('gets password for service', async () => {
      const result = await passwerk.get(service, password)
      assert.strictEqual(result, passwerd)
    })
  })
})

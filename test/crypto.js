'use strict'

/* eslint-env mocha */

const assert = require('assert')
const crypto = require('../lib/crypto')
const fixtures = require('./fixtures/crypto')

describe('crypto', () => {
  describe('#hkdf()', () => {
    const testcases = fixtures.hkdf

    for (const testcase in testcases) {
      it(`tests ${testcase}`, () => {
        const t = testcases[testcase]
        const ikm = Buffer.from(t.ikm, 'hex')
        const salt = Buffer.from(t.salt, 'hex')
        const info = Buffer.from(t.info, 'hex')
        const result = crypto.hkdf(t.length, ikm, salt, info).toString('hex')
        assert.strictEqual(result, t.okm)
      })
    }
  })
})

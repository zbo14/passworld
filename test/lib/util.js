'use strict'

const assert = require('assert')
const util = require('../../lib/util')

describe('lib/util', () => {
  describe('#deserialize()', () => {
    it('fails to deserialize invalid JSON', () => {
      const b64 = Buffer.from('{ "foo: "bar" }').toString('base64')

      try {
        util.deserialize(b64)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Invalid bundle')
      }
    })
  })
})

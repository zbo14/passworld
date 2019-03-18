'use strict'

const assert = require('assert')
const util = require('../lib/util')

describe('util', () => {
  describe('#serialize()', () => {
    it('fails to serialize when there are additional fields', () => {
      try {
        util.serialize({ foo: 'bar' })
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Invalid description')
      }
    })
  })

  describe('#deserialize()', () => {
    it('fails to deserialize when there are additional fields', () => {
      const b64 = Buffer.from('{ "foo": "bar" }').toString('base64')

      try {
        util.deserialize(b64)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Invalid description')
      }
    })
  })
})

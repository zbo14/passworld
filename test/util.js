'use strict'

const assert = require('assert')
const { shouldThrow } = require('./fixtures')
const util = require('../lib/util')

describe('util', () => {
  describe('#serialize()', () => {
    it('fails to serialize when there are additional fields', () => {
      try {
        util.serialize({ foo: 'bar' })
        assert.fail(shouldThrow)
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
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Invalid description')
      }
    })
  })

  describe('#validateFilename()', () => {
    it('throws when filename isn\'t string', () => {
      try {
        util.validateFilename(1)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Expected filename to be a non-empty string')
      }
    })

    it('throws when filename is empty string', () => {
      try {
        util.validateFilename('')
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Expected filename to be a non-empty string')
      }
    })
  })

  describe('#validatePassword()', () => {
    it('throws when password isn\'t a string', () => {
      try {
        util.validatePassword(Symbol('test'))
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Expected password to be a non-empty string')
      }
    })

    it('throws when password is an empty string', () => {
      try {
        util.validatePassword('')
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Expected password to be a non-empty string')
      }
    })
  })

  describe('#validateLength()', () => {
    it('throws when length isn\'t a number', () => {
      try {
        util.validateLength(1.1)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Expected length to be an integer > 0')
      }
    })

    it('throws when length is zero', () => {
      try {
        util.validateLength(0)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Expected length to be an integer > 0')
      }
    })
  })
})

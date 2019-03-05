'use strict'

const assert = require('assert')
const { shouldThrow } = require('./fixtures')
const util = require('../lib/util')

describe('util', () => {
  describe('#validateService()', () => {
    it('throws when service isn\'t string', () => {
      try {
        util.validateService(1)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Expected service to be a non-empty string')
      }
    })

    it('throws when service is empty string', () => {
      try {
        util.validateService('')
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Expected service to be a non-empty string')
      }
    })
  })

  describe('#validatePassphrase()', () => {
    it('throws when passphrase isn\'t a string', () => {
      try {
        util.validatePassphrase(Symbol('test'))
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Expected passphrase to be a non-empty string')
      }
    })

    it('throws when passphrase is an empty string', () => {
      try {
        util.validatePassphrase('')
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Expected passphrase to be a non-empty string')
      }
    })
  })

  describe('#validateLength()', () => {
    it('throws when length isn\'t a number', () => {
      try {
        util.validateLength('1')
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Expected length to be an integer >= 8')
      }
    })

    it('throws when length isn\'t an integer', () => {
      try {
        util.validateLength(1.1)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Expected length to be an integer >= 8')
      }
    })

    it('throws when length is too low', () => {
      try {
        util.validateLength(7)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Expected length to be an integer >= 8')
      }
    })
  })
})

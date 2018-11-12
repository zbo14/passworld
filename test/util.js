'use strict'

const assert = require('assert')
const util = require('../lib/util')

describe('util', () => {
  describe('#validateCreateOptions()', () => {
    it('validates options', () => {
      util.validateCreateOptions({
        service: 'gmail',
        passphrase: 'foo bar baz',
        length: 20
      })

      assert.ok(true)
    })

    it('throws when options isn\'t an object', () => {
      try {
        util.validateCreateOptions([])
        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(
          err.message,
          'Expected options to be an object'
        )
      }
    })

    it('throws when options has invalid service', () => {
      try {
        util.validateCreateOptions({
          service: '',
          passphrase: 'fu bah bash',
          length: 10
        })

        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(
          err.message,
          'Expected options.service to be a non-empty string'
        )
      }
    })

    it('throws when options has invalid passphrase', () => {
      try {
        util.validateCreateOptions({
          service: 'gmail',
          passphrase: '',
          length: 14
        })

        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(
          err.message,
          'Expected options.passphrase to be a non-empty string'
        )
      }
    })

    it('throws when options has invalid length', () => {
      try {
        util.validateCreateOptions({
          service: 'gmail',
          passphrase: 'foo bar baz',
          length: 7
        })

        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(
          err.message,
          'Expected options.length to be an integer >= 8'
        )
      }
    })
  })

  describe('#validateUpdateOptions()', () => {
    it('validates options', () => {
      util.validateUpdateOptions({
        service: 'gmail',
        passphrase: 'foo bar baz',
        length: 20
      })

      assert.ok(true)
    })

    it('throws when options isn\'t an object', () => {
      try {
        util.validateUpdateOptions([])
        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(
          err.message,
          'Expected options to be an object'
        )
      }
    })

    it('throws when options has invalid service', () => {
      try {
        util.validateUpdateOptions({
          service: '',
          passphrase: 'fu bah bash',
          length: 10
        })

        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(
          err.message,
          'Expected options.service to be a non-empty string'
        )
      }
    })

    it('throws when options has invalid passphrase', () => {
      try {
        util.validateUpdateOptions({
          service: 'gmail',
          passphrase: '',
          length: 14
        })

        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(
          err.message,
          'Expected options.passphrase to be a non-empty string'
        )
      }
    })

    it('throws when options has invalid length', () => {
      try {
        util.validateUpdateOptions({
          service: 'gmail',
          passphrase: 'foo bar baz',
          length: 7
        })

        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(
          err.message,
          'Expected options.length to be an integer >= 8'
        )
      }
    })

    it('throws when options has invalid newPassphrase', () => {
      try {
        util.validateUpdateOptions({
          service: 'gmail',
          passphrase: 'foo bar baz',
          length: 32,
          newPassphrase: ''
        })

        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(
          err.message,
          'Expected options.newPassphrase to be a non-empty string'
        )
      }
    })
  })

  describe('#validateGetOpts()', () => {
    it('validates options', () => {
      util.validateGetOptions({
        service: 'gmail',
        passphrase: 'foo bar baz'
      })

      assert.ok(true)
    })

    it('throws when options isn\'t an object', () => {
      try {
        util.validateGetOptions([])
        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(
          err.message,
          'Expected options to be an object'
        )
      }
    })

    it('throws when options has invalid service', () => {
      try {
        util.validateGetOptions({
          service: '',
          passphrase: 'fu bah bash'
        })

        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(
          err.message,
          'Expected options.service to be a non-empty string'
        )
      }
    })

    it('throws when options has invalid passphrase', () => {
      try {
        util.validateGetOptions({
          service: 'gmail',
          passphrase: ''
        })

        assert.ok(false, 'should have thrown error')
      } catch (err) {
        assert.strictEqual(
          err.message,
          'Expected options.passphrase to be a non-empty string'
        )
      }
    })
  })
})

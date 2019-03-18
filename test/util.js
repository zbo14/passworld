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

  describe('#validate()', () => {
    describe('#validate(filename)', () => {
      it('throws when filename isn\'t string', () => {
        try {
          util.validate('filename', 1)
          assert.fail('Should throw error')
        } catch ({ message }) {
          assert.strictEqual(message, 'Expected filename to be a non-empty string')
        }
      })

      it('throws when filename is empty string', () => {
        try {
          util.validate('filename', '')
          assert.fail('Should throw error')
        } catch ({ message }) {
          assert.strictEqual(message, 'Expected filename to be a non-empty string')
        }
      })

      it('validates', () => {
        util.validate('filename', '/path/to/foo')
      })
    })

    describe('#validate(password)', () => {
      it('throws when password isn\'t a string', () => {
        try {
          util.validate('password', Symbol('test'))
          assert.fail('Should throw error')
        } catch ({ message }) {
          assert.strictEqual(message, 'Expected password to be a non-empty string')
        }
      })

      it('throws when password is an empty string', () => {
        try {
          util.validate('password', '')
          assert.fail('Should throw error')
        } catch ({ message }) {
          assert.strictEqual(message, 'Expected password to be a non-empty string')
        }
      })

      it('validates', () => {
        util.validate('password', 'werd werds werrrrdds')
      })
    })

    describe('#validate(length)', () => {
      it('throws when length isn\'t a number', () => {
        try {
          util.validate('length', 1.1)
          assert.fail('Should throw error')
        } catch ({ message }) {
          assert.strictEqual(message, 'Expected length to be an integer > 0')
        }
      })

      it('throws when length is zero', () => {
        try {
          util.validate('length', 0)
          assert.fail('Should throw error')
        } catch ({ message }) {
          assert.strictEqual(message, 'Expected length to be an integer > 0')
        }
      })

      it('validates', () => {
        util.validate('length', 1e3)
      })
    })

    describe('#validate(overwrite)', () => {
      it('throws when overwrite isn\'t "yes" or "no"', () => {
        try {
          util.validate('overwrite', 'y')
          assert.fail('Should throw error')
        } catch ({ message }) {
          assert.strictEqual(message, 'Expected overwrite to be \'yes\' or \'no\'')
        }
      })

      it('validates', () => {
        util.validate('overwrite', 'no')
      })
    })

    it('throws if key not recognized', () => {
      try {
        util.validate('foo', 'bar')
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Unrecognized key')
      }
    })
  })
})

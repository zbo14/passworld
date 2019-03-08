'use strict'

const assert = require('assert')
const EventEmitter = require('events')
const { shouldThrow } = require('./fixtures')
const util = require('../lib/util')

describe('util', () => {
  describe('#decode()', () => {
    it('fails to decode really big buffer', done => {
      const buf = Buffer.alloc(4097)
      const conn = new EventEmitter()

      buf.writeUInt16BE(4095)

      conn.destroy = ({ message }) => {
        try {
          assert.strictEqual(message, 'Message length exceeds buffer size')
          done()
        } catch (err) {
          done(err)
        }
      }

      util.decoder(conn)

      conn.once('message', () => done(new Error('Shouldn\'t get here')))

      conn.emit('data', buf)
    })

    it('decodes a message and keeps leftover', done => {
      const buf = Buffer.alloc(16)
      const conn = new EventEmitter()

      buf.writeUInt16BE(13)
      buf.write('{"foo":"bar"}', 2)

      util.decoder(conn)

      conn.once('message', msg => {
        try {
          assert.deepStrictEqual(msg, { foo: 'bar' })
          done()
        } catch (err) {
          done(err)
        }
      })

      conn.emit('data', buf)
    })
  })

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

  describe('#validatePlaintext()', () => {
    it('throws when plaintext isn\'t a buffer or a string', () => {
      try {
        util.validatePlaintext(1)
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Expected plaintext to be a non-empty buffer or string')
      }
    })

    it('throws when plaintext is an empty buffer', () => {
      try {
        util.validatePlaintext(Buffer.alloc(0))
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Expected plaintext to be a non-empty buffer or string')
      }
    })

    it('throws when plaintext is an empty string', () => {
      try {
        util.validatePlaintext('')
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Expected plaintext to be a non-empty buffer or string')
      }
    })
  })
})

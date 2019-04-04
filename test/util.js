'use strict'

const assert = require('assert')
const { promisify } = require('util')
const exec = promisify(require('child_process').exec)
const util = require('../lib/util')

describe('util', () => {
  describe('#listFilenames()', () => {
    before(async () => {
      await exec([
        'mkdir /tmp/foo',
        'mkdir /tmp/foo/bar',
        'mkdir /tmp/foo/bar/baz',
        'touch /tmp/foo/fu',
        'touch /tmp/foo/bar/bah',
        'touch /tmp/foo/bar/baz/bam'
      ].join(' && '))
    })

    after(async () => {
      await exec('rm -r /tmp/foo')
    })

    it('lists first level of filenames in directory', async () => {
      const filenames = await util.listFilenames('/tmp/foo')
      assert.deepStrictEqual(filenames, [ '/tmp/foo/fu' ])
    })

    it('lists filenames in directory and its subdirectories', async () => {
      const filenames = await util.listFilenames('/tmp/foo', true)

      assert.deepStrictEqual(filenames.sort(), [
        '/tmp/foo/bar/bah',
        '/tmp/foo/bar/baz/bam',
        '/tmp/foo/fu'
      ])
    })

    it('returns empty array when filename is passed', async () => {
      const filenames = await util.listFilenames('/tmp/foo/fu')
      assert.deepStrictEqual(filenames, [])
    })
  })

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

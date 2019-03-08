'use strict'

const assert = require('assert')
const { shouldThrow } = require('./fixtures')
const passworld = require('../lib/passworld')

const filename = '/tmp/foobar'
const password = 'oogly boogly'
const plaintext = 'secreting secrets so secretive'
const newPassword = 'ooglyboogly'

describe('passworld', function () {
  describe('#create()', () => {
    after(async () => {
      await passworld.delete({ filename, password })
    })

    it('creates file', async () => {
      await passworld.create({ filename, password, plaintext })
    })

    it('fails to create file that already exists', async () => {
      try {
        await passworld.create({ filename, password, plaintext })
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'File already exists')
      }
    })
  })

  describe('#read()', () => {
    before(async () => {
      await passworld.create({ filename, password, plaintext })
    })

    after(async () => {
      await passworld.delete({ filename, password })
    })

    it('reads file', async () => {
      const result = await passworld.read({ filename, password })
      assert.strictEqual(result, plaintext)
    })

    it('fails to read file that doesn\'t exist', async () => {
      try {
        await passworld.read({ filename: '/tmp/foobaz', password })
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'File not found')
      }
    })

    it('fails to read file with invalid password', async () => {
      try {
        await passworld.read({ filename, password: 'wrongpassword' })
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Cannot read file: invalid password')
      }
    })
  })

  describe('#update()', () => {
    before(async () => {
      await passworld.create({ filename, password, plaintext })
    })

    after(async () => {
      await passworld.delete({ filename, password: newPassword })
    })

    it('fails to update the file', async () => {
      try {
        await passworld.update({ filename, newPassword: password, oldPassword: newPassword, plaintext })
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Cannot update file: invalid password')
      }
    })

    it('fails to update a file that doesn\'t exist', async () => {
      try {
        await passworld.update({ filename: '/tmp/foobaz', newPassword, oldPassword: password, plaintext })
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'File not found')
      }
    })

    it('updates the file with a different password', async () => {
      await passworld.update({ filename, newPassword, oldPassword: password, plaintext })
      const result = await passworld.read({ filename, password: newPassword })
      assert.strictEqual(result, plaintext)
    })
  })

  describe('#delete()', () => {
    before(async () => {
      await passworld.create({ filename, password, plaintext })
    })

    after(async () => {
      await passworld.delete({ filename, password })
    })

    it('fails to delete a file that doesn\'t exist', async () => {
      try {
        await passworld.delete({ filename: '/tmp/foobaz', password })
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'File not found')
      }
    })

    it('fails to delete a file with invalid password', async () => {
      try {
        await passworld.delete({ filename, password: newPassword })
        assert.fail(shouldThrow)
      } catch ({ message }) {
        assert.strictEqual(message, 'Cannot delete file: invalid password')
      }
    })
  })
})

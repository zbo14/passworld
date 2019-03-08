'use strict'

const assert = require('assert')
const client = require('../lib/client')
const server = require('../lib/server')

const port = 11223

const filename = '/tmp/foobar'
const password = 'ooglyboogly'
const plaintext = 'this is the mess in the messmessage'
const newPassword = 'oogly boogly'

describe('integration', () => {
  before(async () => {
    await server.start(port)
    await client.start(port)
  })

  after(async () => {
    await Promise.all([ client.stop(), server.stop() ])
  })

  it('creates encrypted file', async () => {
    const result = await client.create({ filename, password, plaintext })
    assert.strictEqual(result, 'Successfully created file!')
  })

  it('reads encrypted file', async () => {
    const result = await client.read({ filename, password })
    assert.strictEqual(result, plaintext)
  })

  it('fails to read encrypted file with wrong password', async () => {
    const result = await client.read({ filename, password: newPassword })
    assert.strictEqual(result, 'Cannot read file: invalid password')
  })

  it('updates the encrypted file with new password', async () => {
    const result = await client.update({ filename, newPassword, oldPassword: password, plaintext })
    assert.strictEqual(result, 'Successfully updated file!')
  })

  it('reads encrypted file with new password', async () => {
    const result = await client.read({ filename, password: newPassword })
    assert.strictEqual(result, plaintext)
  })

  it('deletes encrypted file', async () => {
    const result = await client.delete({ filename, password: newPassword })
    assert.strictEqual(result, 'Successfully deleted file!')
  })

  it('fails to read the encrypted file', async () => {
    const result = await client.read({ filename, password: newPassword })
    assert.strictEqual(result, 'File not found')
  })
})

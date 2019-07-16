'use strict'

const assert = require('assert')
const passworld = require('../../lib')
const util = require('../../lib/util')

const dirname1 = `${__dirname}/foo`
const dirname2 = `${dirname1}/baz`
const filename1 = `${dirname1}/bar`
const filename2 = `${dirname2}/bam`
const plaintext1 = Buffer.from('secreting secrets so secretive')
const plaintext2 = Buffer.from('levels')
const password = 'oogly boogly'

describe('lib/index', function () {
  beforeEach(async () => {
    await util.exec([
      `mkdir ${dirname1} ${dirname2}`,
      `echo "${plaintext1.toString()}\\c" > ${filename1}`,
      `echo "${plaintext2.toString()}\\c" > ${filename2}`
    ].join(' && '))
  })

  afterEach(async () => {
    await util.exec(`rm -rf ${dirname1}{,.tar,.tgz}`)
  })

  describe('#encrypt()', () => {
    it('encrypts file', async () => {
      const name = await passworld.encrypt(filename1, password)
      const data = await util.readFile(name)

      assert.strictEqual(name, filename1)
      assert.notDeepStrictEqual(data, plaintext1)
    })

    it('compresses and encrypts file', async () => {
      const name = await passworld.encrypt(filename1, password, { gzip: true })
      const data = await util.readFile(name)

      assert.strictEqual(name, filename1 + '.gz')
      assert.notDeepStrictEqual(data, plaintext1)

      try {
        await util.read(filename1)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Failed to read file or directory name')
      }
    })

    it('fails to encrypt file that doesn\'t exist', async () => {
      try {
        await passworld.encrypt(`${__dirname}/foobar`, password)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Failed to read file or directory name')
      }
    })

    it('encrypts directory', async () => {
      const name = await passworld.encrypt(dirname1, password)
      const data = await util.readFile(name, 'utf8')

      assert.strictEqual(name, dirname1 + '.tar')
      assert(data.startsWith('ey'))

      try {
        await util.read(dirname1)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Failed to read file or directory name')
      }
    })

    it('compresses and encrypts directory', async () => {
      const name = await passworld.encrypt(dirname1, password, { gzip: true })
      const data = await util.readFile(name, 'utf8')

      assert.strictEqual(name, dirname1 + '.tgz')
      assert(data.startsWith('ey'))

      try {
        await util.read(dirname1)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Failed to read file or directory name')
      }
    })
  })

  describe('#decrypt()', () => {
    it('decrypts file', async () => {
      await passworld.encrypt(filename1, password)
      const name = await passworld.decrypt(filename1, password)
      const data = await util.readFile(filename1)

      assert.strictEqual(name, filename1)
      assert.deepStrictEqual(data, plaintext1)
    })

    it('fails to decrypt file that doesn\'t exist', async () => {
      await passworld.encrypt(filename1, password)

      try {
        await passworld.decrypt(`${__dirname}/foobar`, password)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Failed to read filename')
      }
    })

    it('fails to decrypt file with wrong password', async () => {
      await passworld.encrypt(filename1, password)

      try {
        await passworld.decrypt(filename1, 'wrongpassword')
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Decryption failed')
      }
    })

    it('decrypts and decompresses file', async () => {
      await passworld.encrypt(filename1, password, { gzip: true })
      const name = await passworld.decrypt(filename1 + '.gz', password)
      const data = await util.readFile(filename1)

      assert.strictEqual(name, filename1)
      assert.deepStrictEqual(data, plaintext1)
    })

    it('decrypts directory', async () => {
      await passworld.encrypt(dirname1, password)
      const name = await passworld.decrypt(dirname1 + '.tar', password)

      try {
        await util.read(dirname1 + '.tar')
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Failed to read file or directory name')
      }

      assert.strictEqual(name, dirname1)
      assert.deepStrictEqual(await util.read(dirname1), [ 'bar', 'baz' ])
      assert.deepStrictEqual(await util.read(dirname2), [ 'bam' ])
      assert.deepStrictEqual(await util.read(filename1), plaintext1)
      assert.deepStrictEqual(await util.read(filename2), plaintext2)
    })

    it('decrypts and decompresses directory', async () => {
      await passworld.encrypt(dirname1, password, { gzip: true })
      const name = await passworld.decrypt(dirname1 + '.tgz', password)

      try {
        await util.read(dirname1 + '.tgz')
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Failed to read file or directory name')
      }

      assert.strictEqual(name, dirname1)
      assert.deepStrictEqual(await util.read(dirname1), [ 'bar', 'baz' ])
      assert.deepStrictEqual(await util.read(dirname2), [ 'bam' ])
      assert.deepStrictEqual(await util.read(filename1), plaintext1)
      assert.deepStrictEqual(await util.read(filename2), plaintext2)
    })
  })
})

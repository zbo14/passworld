'use strict'

const assert = require('assert')
const { promisify } = require('util')
const exec = promisify(require('child_process').exec)
const readFile = promisify(require('fs').readFile)
const passworld = require('../../lib')

const dirname = `${__dirname}/foo`
const filename = `${dirname}/bar`
const password = 'oogly boogly'
const plaintext = Buffer.from('secreting secrets so secretive')
const length = 30

describe('lib/index', function () {
  describe('#encrypt()', () => {
    beforeEach(async () => {
      await exec([
        `mkdir ${dirname}`,
        `mkdir ${dirname}/baz`,
        `echo "${plaintext}\\c" > ${filename}`,
        `echo "levels\\c" > ${dirname}/baz/bam`
      ].join(' && '))
    })

    afterEach(async () => {
      await exec(`rm -rf ${dirname}`)
    })

    it('encrypts file', async () => {
      const result = await passworld.encrypt(filename, password)
      assert.strictEqual(result, 'Encrypted file!')
    })

    it('fails to encrypt file that doesn\'t exist', async () => {
      try {
        await passworld.encrypt(`${__dirname}/foobar`, password)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Couldn\'t read file, check the filename')
      }
    })

    it('encrypts contents of directory and its subdirectories', async () => {
      let result = await passworld.encrypt(dirname, password, { recurse: true })
      assert.strictEqual(result, 'Encrypted directory!')

      result = await readFile(filename)
      assert(!result.equals(plaintext))

      result = await readFile(dirname + '/baz/bam', 'utf8')
      assert.notStrictEqual(result, 'levels')
    })
  })

  describe('#decrypt()', () => {
    beforeEach(async () => {
      await exec([
        `mkdir ${dirname}`,
        `mkdir ${dirname}/baz`,
        `echo "${plaintext}\\c" > ${filename}`,
        `echo "levels\\c" > ${dirname}/baz/bam`
      ].join(' && '))

      await passworld.encrypt(dirname, password, { recurse: true })
    })

    afterEach(async () => {
      await exec(`rm -rf ${dirname}`)
    })

    it('decrypts file', async () => {
      const result = await passworld.decrypt(filename, password)
      assert(Buffer.isBuffer(result))
      assert.strictEqual(result.toString().trim(), plaintext.toString())
    })

    it('fails to decrypt file that doesn\'t exist', async () => {
      try {
        await passworld.decrypt(`${__dirname}/foobar`, password)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Couldn\'t read file, check the filename')
      }
    })

    it('fails to decrypt file with wrong password', async () => {
      try {
        await passworld.decrypt(filename, 'wrongpassword')
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Decryption failed')
      }
    })

    it('decrypts and overwrites file', async () => {
      const result = await passworld.decrypt(filename, password, { overwrite: true })
      assert.strictEqual(result, 'Decrypted file!')
      const { stdout } = await exec(`cat ${filename}`)
      assert.strictEqual(stdout.trim(), plaintext.toString())
    })

    it('decrypts contents of directory and its subdirectories', async () => {
      const result = await passworld.decrypt(dirname, password, { recurse: true })

      assert.deepStrictEqual(result, {
        [ `${__dirname}/foo/bar` ]: plaintext,
        [ `${__dirname}/foo/baz/bam` ]: Buffer.from('levels')
      })
    })

    it('decrypts contents of directory and its subdirectories and overwrites them', async () => {
      let result = await passworld.decrypt(dirname, password, { overwrite: true, recurse: true })
      assert.strictEqual(result, 'Decrypted directory!')

      result = await readFile(filename)
      assert(result.equals(plaintext))

      result = await readFile(dirname + '/baz/bam', 'utf8')
      assert.strictEqual(result, 'levels')
    })
  })

  describe('#randcrypt()', () => {
    beforeEach(async () => {
      await exec(`mkdir ${dirname}`)
    })

    afterEach(async () => {
      await exec(`rm -rf ${dirname}`)
    })

    it('encrypts random data', async () => {
      const result = await passworld.randcrypt(filename, password, length)
      assert.strictEqual(result, 'Encrypted random data!')
    })

    it('encrypts random data and dumps plaintext', async () => {
      const result = await passworld.randcrypt(filename, password, length, { charLength: true, dump: true })
      assert.strictEqual(result.length, length)
    })

    it('fails to encrypt random data when write fails', async () => {
      try {
        await passworld.randcrypt(dirname, password, length)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Couldn\'t write file, check the filename')
      }
    })
  })
})

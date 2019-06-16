'use strict'

const assert = require('assert')
const { promisify } = require('util')
const exec = promisify(require('child_process').exec)
const fs = require('../../lib/fs')
const passworld = require('../../lib')

const dirname1 = `${__dirname}/foo`
const dirname2 = `${dirname1}/baz`
const filename1 = `${dirname1}/bar`
const filename2 = `${dirname2}/bam`
const plaintext1 = Buffer.from('secreting secrets so secretive')
const plaintext2 = Buffer.from('levels')
const password = 'oogly boogly'
const length = 30

describe('lib/index', function () {
  describe('#encrypt()', () => {
    beforeEach(async () => {
      await exec([
        `mkdir ${dirname1} ${dirname2}`,
        `echo "${plaintext1}\\c" > ${filename1}`,
        `echo "${plaintext2}\\c" > ${filename2}`
      ].join(' && '))
    })

    afterEach(async () => {
      await exec(`rm -rf ${dirname1}`)
    })

    it('encrypts file', async () => {
      const result = await passworld.encrypt(filename1, password)
      assert.strictEqual(result, filename1)
    })

    it('encrypts file and its name', async () => {
      const result = await passworld.encrypt(filename1, password, { rename: true })
      assert.notStrictEqual(result, filename1)

      try {
        await fs.readFile(filename1)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert(message.includes('no such file or directory'))
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

    it('encrypts contents of directory and its subdirectories', async () => {
      let result = await passworld.encrypt(dirname1, password)
      assert.strictEqual(result, dirname1)

      result = await fs.readFile(filename1)
      assert(!result.equals(plaintext1))

      result = await fs.readFile(filename2)
      assert(!result.equals(plaintext2))
    })
  })

  describe('#decrypt({ rename: false })', () => {
    beforeEach(async () => {
      await exec([
        `mkdir ${dirname1}{,/baz}`,
        `echo "${plaintext1}\\c" > ${filename1}`,
        `echo "${plaintext2}\\c" > ${filename2}`
      ].join(' && '))

      await passworld.encrypt(dirname1, password)
    })

    afterEach(async () => {
      await exec(`rm -rf ${dirname1}`)
    })

    it('decrypts file', async () => {
      const result = await passworld.decrypt(filename1, password)

      assert.deepStrictEqual(result, plaintext1)
    })

    it('fails to decrypt file that doesn\'t exist', async () => {
      try {
        await passworld.decrypt(`${__dirname}/foobar`, password)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Failed to read file or directory name')
      }
    })

    it('fails to decrypt file with wrong password', async () => {
      try {
        await passworld.decrypt(filename1, 'wrongpassword')
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Decryption failed')
      }
    })

    it('decrypts and overwrites file', async () => {
      const result = await passworld.decrypt(filename1, password, { overwrite: true })
      assert.strictEqual(result, filename1)
      const { stdout } = await exec(`cat ${filename1}`)
      assert.strictEqual(stdout.trim(), plaintext1.toString())
    })

    it('decrypts contents of directory', async () => {
      const result = await passworld.decrypt(dirname1, password)

      assert.deepStrictEqual(result, {
        bar: plaintext1,
        baz: { bam: plaintext2 }
      })
    })

    it('decrypts contents of directory and overwrites it', async () => {
      let result = await passworld.decrypt(dirname1, password, { overwrite: true })
      assert.strictEqual(result, dirname1)

      result = await fs.readFile(filename1)
      assert.deepStrictEqual(result, plaintext1)

      result = await fs.readFile(filename2)
      assert.deepStrictEqual(result, plaintext2)
    })
  })

  describe('#decrypt({ rename: true })', () => {
    let dirname

    beforeEach(async () => {
      await exec([
        `mkdir ${dirname1}{,/baz}`,
        `echo "${plaintext1}\\c" > ${filename1}`,
        `echo "${plaintext2}\\c" > ${filename2}`
      ].join(' && '))

      dirname = await passworld.encrypt(dirname1, password, { rename: true })
    })

    afterEach(async () => {
      await exec(`rm -rf ${dirname} ${dirname1}`)
    })

    it('decrypts dirname and directory', async () => {
      const result = await passworld.decrypt(dirname, password, { rename: true })

      assert.deepStrictEqual(result, {
        bar: plaintext1,
        baz: { bam: Buffer.from('levels') }
      })
    })

    it('decrypts dirname and directory and overwrites it', async () => {
      let result = await passworld.decrypt(dirname, password, { rename: true, overwrite: true })
      assert.strictEqual(result, dirname1)

      result = await fs.readdir(dirname1)
      assert.deepStrictEqual(result, [ 'bar', 'baz' ])

      result = await fs.readdir(dirname2)
      assert.deepStrictEqual(result, [ 'bam' ])

      result = await fs.readFile(filename1)
      assert.deepStrictEqual(result, plaintext1)

      result = await fs.readFile(filename2)
      assert.deepStrictEqual(result, plaintext2)
    })
  })

  describe('#randcrypt()', () => {
    beforeEach(async () => {
      await exec(`mkdir ${dirname1}`)
    })

    afterEach(async () => {
      await exec(`rm -rf ${dirname1}`)
    })

    it('encrypts random data', async () => {
      const result = await passworld.randcrypt(filename1, password, length)
      assert.strictEqual(result, filename1)
    })

    it('encrypts random data', async () => {
      const result = await passworld.randcrypt(filename1, password, length)
      assert.strictEqual(result, filename1)
    })

    it('encrypts random data and filename', async () => {
      const result = await passworld.randcrypt(filename1, password, length, { rename: true })
      assert.notStrictEqual(result, filename1)
      await fs.unlink(result)
    })

    it('encrypts random data and dumps plaintext', async () => {
      const result = await passworld.randcrypt(filename1, password, length, { dump: true })
      assert.strictEqual(result.length, length)
    })

    it('fails to encrypt random data when write fails', async () => {
      try {
        await passworld.randcrypt(dirname1, password, length)
        assert.fail('Should throw error')
      } catch ({ message }) {
        assert.strictEqual(message, 'Failed to write file')
      }
    })
  })
})

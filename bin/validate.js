'use strict'

const validators = {
  dump (dump) {
    if (dump !== 'yes' && dump !== 'no') {
      throw new Error('Expected dump to be \'yes\' or \'no\'')
    }
  },

  filename (filename) {
    if (typeof filename !== 'string' || !filename) {
      throw new Error('Expected filename to be a non-empty string')
    }
  },

  length (length) {
    if (!Number.isInteger(length) || length <= 0) {
      throw new Error('Expected length to be an integer > 0')
    }
  },

  overwrite (overwrite) {
    if (overwrite !== 'yes' && overwrite !== 'no') {
      throw new Error('Expected overwrite to be \'yes\' or \'no\'')
    }
  },

  password (password) {
    if (typeof password !== 'string' || !password) {
      throw new Error('Expected password to be a non-empty string')
    }
  }
}

module.exports = usage => obj => {
  Object.entries(obj).forEach(([ key, value ]) => {
    const validate = validators[ key ]

    if (!validate) throw new Error('Unrecognized key')

    try {
      validate(value)
    } catch ({ message }) {
      throw new Error(`${message}\n\n${usage}`)
    }
  })
}

'use strict'

const validators = {
  path (path) {
    if (typeof path !== 'string' || !path) {
      throw new Error('Expected path to be a non-empty string')
    }
  },

  length (length) {
    if (!Number.isInteger(length) || length <= 0) {
      throw new Error('Expected length to be an integer > 0')
    }
  },

  password (password) {
    if (typeof password !== 'string' || !password) {
      throw new Error('Expected password to be a non-empty string')
    }
  }
}

module.exports = usage => (key, value) => {
  try {
    validators[ key ](value)
  } catch ({ message }) {
    throw new Error(message + '\n\n' + usage)
  }
}

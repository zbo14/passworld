# passworld

A library and CLI to encrypt/decrypt files and directories with passwords.

## How does it work?

First you tell `passworld` what you want to encrypt and you give it a password. It uses [scrypt](https://en.wikipedia.org/wiki/Scrypt) to derive a key from your password. Then it encrypts your file or directory with [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode), using the derived key as the encryption key. The output contains the ciphertext (encrypted file or directory), a pseudo-randomly generated scrypt salt, and a pseudo-randomly generated encryption nonce.

When you want to decrypt something you've encrypted, you hand `passworld` the output from the encryption step and give it your password. With the password and salt provided, it's able to re-derive the encryption key. With the encryption key and nonce provided, it's able to decrypt the file or directory contents.

## Install

Make sure you have [Docker](https://docs.docker.com/install/), [Node](https://nodejs.org/en/download/), and [nvm](https://github.com/nvm-sh/nvm) installed.

Then `git clone` the repo, `cd` into it, `nvm i`, and `npm i [-g]`.

## Usage

**Note:** each JS example assumes top-level `async/await` and each CLI command prompts you for a password.

## Encrypt a file

### JS

```js
await passworld.encrypt('/path/to/file', 'password', { gzip })
```

### CLI

```
$ passworld encrypt [-g] path/to/file
```

#### Options

##### gzip `[-g]`
Compress the file before encryption.

## Encrypt a directory

### JS

```js
await passworld.encrypt('/path/to/dir', 'password', { gzip, recurse })
```

### CLI

```
$ passworld encrypt [-g] [-r] path/to/dir
```

#### Options

##### gzip `[-g]`
Compress the directory contents before encryption.

##### recurse `[-r]`
Recurse through subdirectories and encrypt them.

## Decrypt a file

### JS

```js
await passworld.decrypt('/path/to/file', 'password', { gunzip, overwrite })
```

### CLI

```
$ passworld decrypt [-g] [-o] /path/to/file
```

#### Options

##### gunzip `[-g]`
Decompress the file after decryption.

##### overwrite `[-o]`
Overwrite the file with the decrypted contents.

## Decrypt a directory

### JS

```js
await passworld.decrypt('/path/to/dir', 'password', { gunzip, overwrite, recurse })
```

### CLI

```
$ passworld decrypt [-g] [-o] [-r] /path/to/dir
```

#### Options

##### gunzip `[-g]`
Decompress the directory contents after decryption.

##### overwrite `[-o]`
Overwrite the directory with the decrypted contents.

##### recurse `[-r]`
Recurse through subdirectories and decrypt them.

## Encrypt random data to a file

Generate pseudo-random, base64-encoded data of specified length, encrypt it, and write the result to a file.

This is useful for generating passwords since the base64 alphabet *usually* satisfies password constraints.

### JS

```js
await passworld.randcrypt('/path/to/file', 'password', length, { dump, gzip })
```

### CLI

```
$ passworld randcrypt [-d] [-g] /path/to/file $LENGTH
```

#### Options

##### dump `[-d]`
Dump the generated plaintext to stdout.

##### gzip `[-g]`
Compress the data before encryption.


## Documentation

`npm run doc`

## Test

`npm test`

## Lint

`npm run lint`

## Contributing

Please do!

If you find a bug or want a feature added, [open an issue](https://github.com/zbo14/passworld/issues/new). Then, if you feel so inclined, [create a pull request](https://github.com/zbo14/passworld/compare/develop...) addressing the issue. You should push your changes to a feature branch and request merge to `develop`.

You don't *have* to open an issue before a pull request, but it facilitates discussion and gives you a chance to receive feedback before diving into code.

Make sure linting and tests pass and coverage is 💯 before creating a pull request!

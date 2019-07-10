# passworld

A library and CLI to encrypt/decrypt files and directories with passwords.

## How does it work?

First, you tell `passworld` what you want to encrypt and give it a password. It uses [scrypt](https://en.wikipedia.org/wiki/Scrypt) to derive two keys from your password. It encrypts your file or directory with the first key using [secretbox](http://nacl.cr.yp.to/secretbox.html). Then it encrypts the result from the previous step with the second key using [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode). If the encryption target is a directory, `passworld` creates a tar archive, encrypts that, and `rm -r`s the directory.

The output, or "bundle", contains the ciphertext (doubly encrypted file or directory), two CSPRNG scrypt salts, two CSPRNG encryption nonces, and an authentication tag for `AES-GCM`.

When you want to decrypt something, you hand `passworld` the bundle and your password. It derives the second key from your password and the second salt in the bundle. Then it decrypts the ciphertext with the second key and the second nonce in the bundle using `AES-GCM`. It performs similar steps to recover the first key and subsequently decrypts using `secretbox`. When you tell `passworld` to decrypt a tar archive, it should extract it following decryption and then remove it. Your plaintext file or directory should now be in the filesystem.

## A note on security

I'll try to keep Node and dependency versions up to date/bump them when security vulnerabilities are addressed. If you discover a vulnerability in `passworld`, let me know! Refer to the [contributing section](#Contributing) to see how you can help.

**WARNING:** `passworld` hasn't received a formal security audit so use it at your own risk and beware of 🐉🐉!

## Install

Make sure you have [Node](https://nodejs.org/en/download/) and [nvm](https://github.com/nvm-sh/nvm) installed.

Then `git clone` the repo, `cd` into it, `nvm i`, and `npm i [-g]`.

## Usage

**Note:** each JS example assumes top-level `async/await` and each CLI command prompts you for a password.

## Encrypt a file

Encrypt a file and overwrite it with the encrypted contents.

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
Compress before encryption.

## Encrypt a directory

Create a tar archive of a directory, encrypt it, write the encrypted contents to `/path/to/dir.{tar|tgz}`, and remove the original directory.

### JS

```js
await passworld.encrypt('/path/to/dir', 'password', { gzip })
```

### CLI

```
$ passworld encrypt [-g] path/to/dir
```

#### Options

##### gzip `[-g]`
Compress before encryption.

**Note:** the encrypted tar archive will have extension `.tgz` instead of `.tar`.

## Decrypt a file

Decrypt a file and overwrite it with the plaintext contents.

### JS

```js
await passworld.decrypt('/path/to/file', 'password')
```

### CLI

```
$ passworld decrypt /path/to/file
```

## Decrypt a directory

Decrypt an encrypted tar archive, extract the original directory, and remove the archive.

### JS

```js
await passworld.decrypt('/path/to/dir.{tar|tgz}', 'password')
```

### CLI

```
$ passworld decrypt /path/to/dir.{tar|tgz}
```

## "Recrypt" a file or directory

Decrypt a file or directory and encrypt it again. 

This command prompts you for two passwords: the first for decryption and the second for encryption.

If you enter an empty password the second time, `passworld` will use the same password to encrypt.

### CLI

```
$ passworld recrypt [-g] /path/to/*
```

#### Options

##### gzip `[-g]`
Compress before encryption.

## Documentation

`npm run doc`

## Test

`npm test`

## Lint

`npm run lint`

## Contributing

Please do!

If you find a bug, want a feature added, or just have a question, feel free to [open an issue](https://github.com/zbo14/passworld/issues/new). In addition, you're welcome to [create a pull request](https://github.com/zbo14/passworld/compare/develop...) addressing an issue. You should push your changes to a feature branch and request merge to `develop`.

Make sure linting and tests pass and coverage is 💯 before creating a pull request!

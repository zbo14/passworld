# passworld

A library and CLI to encrypt/decrypt files and directories with passwords.

## How does it work?

First you tell `passworld` what you want to encrypt and you give it a password. It uses [scrypt](https://en.wikipedia.org/wiki/Scrypt) to derive two keys from your password. Then it encrypts your file or directory with the first key using [secretbox](http://nacl.cr.yp.to/secretbox.html) and then with the second key using [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode).

**Note:** in the case of a directoy, `passworld` creates a tarball, encrypts that, and `rm -r`s the directory. When you tell `passworld` to decrypt a file ending in `.tar` or `.tgz`, it should extract the decrypted archive and remove it.

The output, or "bundle", contains the ciphertext (doubly encrypted file or directory), two CSPRNG scrypt salts, and two CSPRNG encryption nonces.

When you want to decrypt something, you hand `passworld` the bundle and your password. It derives the second key from your password and the second salt in the bundle. Then it decrypts the ciphertext with the second key and nonce using `AES-GCM`. It performs similar steps to recover the first key and decrypts using `secretbox`. Your plaintext file or directory should now be in the filesystem.

## A note on security

I'll try to keep Node and dependency versions up to date/bump them when security vulnerabilities are addressed.

If you discover a vulnerability in `passworld`, let me know! Refer to the [contributing section](#Contributing) to see how you can help.

**WARNING:** `passworld` hasn't received a formal security audit so use it at your own risk and beware of 🐉🐉!

## Install

Make sure you have [Node](https://nodejs.org/en/download/) and [nvm](https://github.com/nvm-sh/nvm) installed.

Then `git clone` the repo, `cd` into it, `nvm i`, and `npm i [-g]`.

## Usage

**Note:** each JS example assumes top-level `async/await` and each CLI command prompts you for a password.

## Encrypt a file

### JS

```js
await passworld.encrypt('/path/to/file', 'password')
```

### CLI

```
$ passworld encrypt path/to/file
```

## Encrypt a directory

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
Encrypt a gzipped tar archive.

## Decrypt a file

### JS

```js
await passworld.decrypt('/path/to/file', 'password')
```

### CLI

```
$ passworld decrypt /path/to/file
```

## Decrypt a directory

### JS

```js
await passworld.decrypt('/path/to/*.{tar|tgz}', 'password')
```

### CLI

```
$ passworld decrypt /path/to/*.{tar|tgz}
```

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

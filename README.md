# passworld

A library and CLI toolset to encrypt/decrypt files and directories with passwords.

## How does it work?

First you tell `passworld` what you want to encrypt and you give it a password. It uses [scrypt](https://en.wikipedia.org/wiki/Scrypt) to derive a key from your password. Then it encrypts your file or directory with [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode), using the derived key as the encryption key. The output contains the ciphertext (encrypted file or directory), a pseudo-randomly generated scrypt salt, and a pseudo-randomly generated encryption nonce.

When you want to decrypt something you've encrypted, you hand `passworld` the output from the encryption step and give it your password. With the password and salt provided, it's able to re-derive the encryption key. With the encryption key and nonce provided, it's able to decrypt the file or directory contents.

## Install

Make sure you have the following installed:

* [Docker](https://docs.docker.com/install/)
* [Node](https://nodejs.org/en/download/)
* [nvm](https://github.com/nvm-sh/nvm)
* [OpenSSH](https://www.openssh.com/)

Then `git clone` the repo and `sh /path/to/passworld/install.sh`.

This command installs the library and CLI tools.

## Usage

There are 3 major components:

### [passworld](./usage/passworld.md)

A Node library and a CLI for encrypting and decrypting files and directories.

### [passworld-server](./usage/passworld-server.md)

A Dockerized SSH server with the `passworld` CLI.

### [passworld-client](./usage/passworld-client.md)

A client that can SSH into `passworld-server` and encrypt/decrypt your files and directories.

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

Make sure linting and tests pass and coverage is 💯 before opening a pull request!

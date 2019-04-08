# passworld

Encrypt and decrypt files and directories with passwords.

## Install

Clone the repo, `nvm i`, and `npm i [-g]`

## Usage

Note: each of the CLI commands will prompt you for a password.

### Encrypt a file

#### JS

```js
await passworld.encrypt('/path/to/file', 'password', { gzip: Boolean })
```

#### CLI

```
$ passworld encrypt [-g] path/to/file
```

### Encrypt a directory

#### JS

```js
await passworld.encrypt('/path/to/dir', 'password', { gzip: Boolean, recurse: Boolean })
```

#### CLI

```
$ passworld encrypt [-g] [-r] path/to/dir
```

### Decrypt a file

#### JS

```js
await passworld.decrypt('/path/to/file', 'password', { gunzip: Boolean, overwrite: Boolean })
```

#### CLI

```
$ passworld decrypt [-g] [-o] /path/to/file
```

### Decrypt a directory

#### JS

```js
await passworld.decrypt('/path/to/dir', 'password', { gunzip: Boolean, overwrite: Boolean, recurse: Boolean })
```

#### CLI

```
$ passworld decrypt [-g] [-o] [-r] /path/to/dir
```

### Encrypt random data to a file

Generate pseudo-random data of specified byte-length, encrypt it, and write the result to a file.

#### JS

```js
const byteLength = 32

await passworld.randcrypt('/path/to/file', 'password', byteLength, { dump: Boolean, gzip: Boolean })
```

#### CLI

```
$ BYTE_LENGTH=32

$ passworld randcrypt [-d] [-g] /path/to/file $BYTE_LENGTH
```

### Server

#### Build

```
$ passworld-server build
```

Build the server image.

#### Initialize

```
$ passworld-server init
```

This command should be run once. It creates a directory with the server SSH keys.

#### Start

```
$ passworld-server start [-p]
```

Start the server with password authentication enabled or disabled (`-p` to enable). Even when password authentication is disabled, you'll be prompted to enter a password for user `passworld`. Clients will still need to authenticate with their public keys.

Note: you should enable password authentication *only* when a new client needs to copy its public key. Once the client has copied its public key, you should restart the server with password authentication disabled. If/when another client needs to copy its public key, you can restart the server with password authentication enabled and disable it again once the client has copied its public key.

#### Stop

```
$ passworld-server stop [-v]
```

Stop the server (`-v` removes the named volume as well).

#### Restart

```
$ passworld-server restart [-p]
```

Stop and start the server again.

### Client

#### Initialize

```
$ passworld-client init HOSTNAME
```

This command should be run once for each new client. It creates a directory with the client SSH keys and copies the public key to the server. You'll need to authenticate with a password.

#### SSH

```
$ passworld-client ssh HOSTNAME
```

SSH into the server, where you can then execute commands with the `passworld` CLI.

## Documentation

`npm run doc`

## Test

`npm test`

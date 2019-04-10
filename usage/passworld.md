# passworld

Use the `passworld` library or CLI tool to encrypt and decrypt your files and directories.

Note: each of the CLI commands will prompt you for a password.

## Encrypt a file

### JS

```js
await passworld.encrypt('/path/to/file', 'password', { gzip: Boolean })
```

### CLI

```
$ passworld encrypt [-g] path/to/file
```

## Encrypt a directory

### JS

```js
await passworld.encrypt('/path/to/dir', 'password', { gzip: Boolean, recurse: Boolean })
```

### CLI

```
$ passworld encrypt [-g] [-r] path/to/dir
```

## Decrypt a file

### JS

```js
await passworld.decrypt('/path/to/file', 'password', { gunzip: Boolean, overwrite: Boolean })
```

### CLI

```
$ passworld decrypt [-g] [-o] /path/to/file
```

## Decrypt a directory

### JS

```js
await passworld.decrypt('/path/to/dir', 'password', { gunzip: Boolean, overwrite: Boolean, recurse: Boolean })
```

### CLI

```
$ passworld decrypt [-g] [-o] [-r] /path/to/dir
```

## Encrypt random data to a file

Generate pseudo-random data of specified byte-length, encrypt it, and write the result to a file.

### JS

```js
const byteLength = 32

await passworld.randcrypt('/path/to/file', 'password', byteLength, { dump: Boolean, gzip: Boolean })
```

### CLI

```
$ BYTE_LENGTH=32

$ passworld randcrypt [-d] [-g] /path/to/file $BYTE_LENGTH
```

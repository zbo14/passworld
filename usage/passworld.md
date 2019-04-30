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

#### Options

##### gzip `[-g]`
Compress the file before encryption.

## Encrypt a directory

### JS

```js
await passworld.encrypt('/path/to/dir', 'password', { gzip: Boolean, recurse: Boolean })
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
await passworld.decrypt('/path/to/file', 'password', { gunzip: Boolean, overwrite: Boolean })
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
await passworld.decrypt('/path/to/dir', 'password', { gunzip: Boolean, overwrite: Boolean, recurse: Boolean })
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
const length = 32

await passworld.randcrypt('/path/to/file', 'password', length, { dump: Boolean, gzip: Boolean })
```

### CLI

```
$ LENGTH=32

$ passworld randcrypt [-d] [-g] /path/to/file $LENGTH
```

#### Options

##### dump `[-d]`
Dump the generated plaintext to stdout.

##### gzip `[-g]`
Compress the data before encryption.

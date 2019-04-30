# passworld-server

An SSH server with the `passworld` CLI and your encrypted files and directories.

## Build

```
$ passworld-server build
```

Build the server image.

## Initialize

```
$ passworld-server init
```

Create a directory with the server SSH keys. This command should be run once.

## Start

```
$ passworld-server start [-p]
```

Start the server with password authentication enabled `[-p]` or disabled. Even when password authentication is disabled, you'll be prompted to enter a password for user `passworld`. Clients will still need to authenticate with their public keys.

Note: you should enable password authentication *only* when a client needs to copy its public key. Once the client has copied its public key, you should restart the server with password authentication disabled. If/when another client needs to copy its public key, you can restart the server with password authentication enabled and disable it again once the client has copied its public key.

## Stop

```
$ passworld-server stop [-v]
```

Stop the server and optionally remove the named volume `[-v]`.

## Restart

```
$ passworld-server restart [-p] [-v]
```

Stop and start the server again.

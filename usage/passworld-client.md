# passworld-client

## Initialize

```
$ passworld-client init HOSTNAME
```

Create a directory with the client SSH keys and copy the public key to the server. You'll need to enter a password to authenticate with the server. This command should be run once for each client.

## SSH

```
$ passworld-client ssh HOSTNAME
```

SSH into the server, where you can execute commands with the `passworld` CLI.

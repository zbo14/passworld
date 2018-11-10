# passwerk

Another password manager

Generates variable-length passwords and encrypts/decrypts them with passphrases you provide.

You can encrypt all your passwords with the same passphrase or with different ones.

## Install

Clone the repo and `npm i`

## Usage

Start the electron application

`npm start`

### Setting a password

Enter a service name, a passphrase to encrypt the password, and the desired length of the password.

If the operation is successful, the encrypted password will be stored in `./passwords/{service}`.

### Getting a password

Enter the service name and passphrase to decrypt the password.

If decryption is successful, the password will be copied to your clipboard for 30 seconds.

### Changing a password

Enter the service name, a new passphrase to encrypt the new password, the old passphrase to decrypt the old password, and the desired length of the new password.

If the old password is successfully decrypted, the new password will be encrypted and stored in place of it.

## Documentation

Generate the documentation and open in browser

`npm run doc`

## Test

Run the unit tests

`npm test`

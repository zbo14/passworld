#!/bin/bash -e

. ~/.nvm/nvm.sh

nvm i && npm link &

chmod u+x passworld-client passworld-server

ln -s $PWD/passworld-client /usr/local/bin
ln -s $PWD/passworld-server /usr/local/bin

wait

echo "Done!"

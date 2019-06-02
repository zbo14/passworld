#!/bin/sh

/usr/sbin/sshd -4D -f /app/sshd_config -o "PasswordAuthentication=$1"

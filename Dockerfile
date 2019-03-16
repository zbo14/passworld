FROM node:10.15.2-alpine

ENV PASSWORD_AUTH no

COPY . /app

WORKDIR /app

RUN apk add --no-cache --update --upgrade openssh && \
    adduser -D passworld && \
    npm i -g && \
    ln -sf /dev/null ~/.ash_history

ENTRYPOINT sh entrypoint $PASSWORD_AUTH

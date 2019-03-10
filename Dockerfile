FROM node:10.15.2-alpine

COPY . /app

ENV PASSWORD_AUTH no

WORKDIR /app

RUN apk add --no-cache --update --upgrade openssh && \
    adduser -D passworld && \
    npm link

ENTRYPOINT sh entrypoint $PASSWORD_AUTH

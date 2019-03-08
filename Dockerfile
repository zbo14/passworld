FROM node:10.15.2-alpine

COPY . /

RUN apk add --no-cache --update --upgrade openssh && \
    adduser -D passworld

WORKDIR /app

CMD node server

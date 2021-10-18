FROM golang:alpine as backend-build
MAINTAINER Wisdman <wisdman@ajaw.it>

ADD . /build
WORKDIR /build

ARG APP_PATH

RUN go build -mod=vendor -o app ./$APP_PATH

FROM alpine
MAINTAINER Wisdman <wisdman@ajaw.it>

COPY --from=backend-build /build/app /

ADD ./ssl/server.crt /ssl/server.crt
ADD ./ssl/server.key /ssl/server.key
ADD ./config.json /config.json

EXPOSE 443
CMD ["/app"]
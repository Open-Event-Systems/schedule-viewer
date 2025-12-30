FROM golang:1.25.5-alpine3.23 AS build
ENV CGO_ENABLED=1
RUN adduser -D -h /build app
RUN --mount=type=cache,id=apk,target=/etc/apk/cache \
    apk add build-base
USER app
WORKDIR /build
COPY go.mod go.sum ./
RUN --mount=type=cache,id=go,uid=1000,gid=1000,target=/build/go/pkg/mod \
    go mod download
COPY cmd/ cmd/
COPY internal/ internal/
RUN --mount=type=cache,id=go,uid=1000,gid=1000,target=/build/go/pkg/mod \
    go build -ldflags "-s -w" ./cmd/server


FROM alpine:3.23.2
RUN adduser -D app
RUN mkdir /config
RUN mkdir /data && chown app:app /data
COPY schedule.example.yaml /config/schedule.yaml
COPY --from=build /build/server /usr/local/bin/server
USER app
VOLUME /data
ENTRYPOINT [ "/usr/local/bin/server", "-config", "/config/schedule.yaml", "-port", "8080" ]

FROM golang:1.26.2-alpine3.23 AS build
RUN adduser -h /build -D build
USER build
WORKDIR /build
ENV GOPATH=/build/go
RUN mkdir -p /build/go/pkg/mod /build/.cache
COPY --chown=build:build go.mod go.sum ./
RUN --mount=type=cache,sharing=locked,uid=1000,gid=1000,target=/build/go/pkg/mod \
    go mod download
COPY --chown=build:build cmd/ cmd/
COPY --chown=build:build internal/ internal/
RUN --mount=type=cache,sharing=locked,uid=1000,gid=1000,target=/build/go/pkg/mod \
    --mount=type=cache,sharing=locked,uid=1000,gid=1000,target=/build/.cache/go-build \
    go build -ldflags "-w -s" -o ogp-server ./cmd/server


FROM alpine:3.23.4 AS ogp-server
RUN adduser -h /app -D app
USER app
WORKDIR /app
COPY --chown=root:root --from=build /build/ogp-server /usr/local/bin/
EXPOSE 8080
ENTRYPOINT [ "/usr/local/bin/ogp-server" ]

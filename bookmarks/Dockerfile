ARG MIGRATE_VERSION=4.19.1


FROM golang:1.26.2-alpine3.23 AS build-base
RUN --mount=type=cache,sharing=locked,target=/var/cache/apk \
    apk add build-base git
RUN adduser -h /build -D build
USER build
WORKDIR /build
ENV GOPATH=/build/go
RUN mkdir -p /build/go/pkg/mod /build/.cache


FROM build-base AS build
COPY --chown=build:build go.mod go.sum ./
RUN --mount=type=cache,sharing=locked,uid=1000,gid=1000,target=/build/go/pkg/mod \
    go mod download
COPY --chown=build:build cmd/ cmd/
COPY --chown=build:build internal/ internal/
RUN --mount=type=cache,sharing=locked,uid=1000,gid=1000,target=/build/go/pkg/mod \
    --mount=type=cache,sharing=locked,uid=1000,gid=1000,target=/build/.cache/go-build \
    CGO_ENABLED=1 go build -ldflags "-w -s" -o bookmarks-server ./cmd/server


FROM build-base AS build-migrate
ARG MIGRATE_VERSION
RUN --mount=type=cache,sharing=locked,uid=1000,gid=1000,target=/build/go/pkg/mod \
    --mount=type=cache,sharing=locked,uid=1000,gid=1000,target=/build/.cache/go-build \
    CGO_ENABLED=1 go install -tags sqlite3 github.com/golang-migrate/migrate/v4/cmd/migrate@v${MIGRATE_VERSION}


FROM alpine:3.23.4 AS ogp-server
RUN adduser -h /app -D app
USER app
WORKDIR /app
RUN mkdir /app/data
COPY --from=build-migrate --chown=root:root /build/go/bin/migrate /usr/local/bin/migrate
COPY docker-entrypoint.sh /
COPY migrations/ /migrations/
COPY --chown=app:app config.example.yaml config.yaml
RUN chmod 0600 config.yaml
COPY --chown=root:root --from=build /build/bookmarks-server /usr/local/bin/
EXPOSE 8000
VOLUME [ "/app/data" ]
ENTRYPOINT [ "/docker-entrypoint.sh" ]

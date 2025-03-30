FROM golang:1.24.1-alpine3.21 AS build
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY cmd/ cmd/
COPY internal/ internal/
RUN go build ./cmd/server


FROM alpine:3.21.3
RUN adduser -D app
RUN mkdir /data && chown app:app /data
COPY --from=build /build/server /usr/local/bin/server
USER app
EXPOSE 8001
ENTRYPOINT [ "/usr/local/bin/server" ]
CMD [ "-config", "oembed.yaml", "-port", "8001" ]

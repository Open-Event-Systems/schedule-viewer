package main

import (
	"bookmarks/internal/server"
	"net/http"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {

	// TODO: config
	conn, err := gorm.Open(
		sqlite.Open("test.sqlite"),
		&gorm.Config{
			SkipDefaultTransaction: true,
			TranslateError: true,
		},
	)

	if err != nil {
		panic(err)
	}

	handler := server.NewHandler(conn, "changeit")

	server := &http.Server{
		Addr:    ":8080",
		Handler: handler,
	}

	server.ListenAndServe()
}

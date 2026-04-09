package main

import (
	"bookmarks/internal/config"
	"bookmarks/internal/server"
	"flag"
	"net"
	"net/http"
	"strconv"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	var configPath string
	var port int

	flag.StringVar(&configPath, "config", "config.yaml", "config file path")
	flag.IntVar(&port, "port", 8080, "port")
	flag.Parse()

	cfg := config.LoadConfig(configPath)

	conn, err := gorm.Open(
		sqlite.Open(cfg.DBPath),
		&gorm.Config{
			SkipDefaultTransaction: true,
			TranslateError:         true,
		},
	)

	if err != nil {
		panic(err)
	}

	if res := conn.Exec("PRAGMA journal_mode=WAL"); res.Error != nil {
		panic(res.Error)
	}

	handler := server.NewHandler(cfg, conn, "changeit")

	server := &http.Server{
		Addr:    net.JoinHostPort("", strconv.Itoa(port)),
		Handler: handler,
	}

	server.ListenAndServe()
}

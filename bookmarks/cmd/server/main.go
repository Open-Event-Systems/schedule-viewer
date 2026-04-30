package main

import (
	"bookmarks/internal/config"
	"bookmarks/internal/server"
	"context"
	"errors"
	"flag"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
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

	handler := server.NewHandler(cfg, conn, cfg.TokenSecret)

	server := &http.Server{
		Addr:    net.JoinHostPort("", strconv.Itoa(port)),
		Handler: handler,
	}

	doneChan := make(chan struct{})
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt)

	go func() {
		defer close(doneChan)
		log.Printf("listening on :%d", port)
		err = server.ListenAndServe()
	}()

	select {
	case <-sigChan:
		signal.Reset(os.Interrupt)
		server.Shutdown(context.Background())
	case <-doneChan:
		signal.Reset(os.Interrupt)
	}

	<-doneChan

	if err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Println(err)
		os.Exit(1)
	}
}

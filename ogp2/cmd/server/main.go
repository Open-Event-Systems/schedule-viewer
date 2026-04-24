package main

import (
	"context"
	"errors"
	"flag"
	"log"
	"net"
	"net/http"
	"ogp/internal/handler"
	"os"
	"os/signal"
	"strconv"
)

func main() {
	var port int

	flag.IntVar(&port, "port", 8000, "listen port")
	flag.Parse()

	httpServer := http.Server{
		Addr:    net.JoinHostPort("", strconv.Itoa(port)),
		Handler: handler.NewHandler(),
	}

	doneChan := make(chan struct{})
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt)
	var serverErr error

	go func() {
		defer close(doneChan)
		serverErr = httpServer.ListenAndServe()
	}()

	select {
	case <-doneChan:
	case <-sigChan:
		signal.Reset(os.Interrupt)
		httpServer.Shutdown(context.Background())
	}

	<-doneChan

	if !errors.Is(serverErr, http.ErrServerClosed) {
		log.Println(serverErr)
		os.Exit(1)
	}
}

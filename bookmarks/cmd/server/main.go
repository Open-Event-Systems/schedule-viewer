package main

import (
	"bookmarks/internal/config"
	"bookmarks/internal/db"
	"bookmarks/internal/server"
	"context"
	"database/sql"
	"flag"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	var configFile string
	var port int

	flag.StringVar(&configFile, "config", "schedule.yaml", "schedule config path")
	flag.IntVar(&port, "port", 8080, "port to listen on")

	flag.Parse()

	configObj := config.LoadConfig(configFile)

	dbConn, err := sql.Open("sqlite3", configObj.DB_URL)
	if err != nil {
		panic(err)
	}
	defer dbConn.Close()

	func() {
		txn, err := dbConn.BeginTx(context.Background(), nil)
		if err != nil {
			panic(err)
		}
		defer txn.Rollback()
		err = db.CreateTables(txn)
		if err != nil {
			panic(err)
		}
		err = txn.Commit()
		if err != nil {
			panic(err)
		}
	}()

	h := server.NewHandlers(dbConn, configObj.URLPrefix, configObj.AllowedOrigins, configObj.ScheduleURLs, configObj.Secret)

	s := &http.Server{
		Addr:    net.JoinHostPort("", strconv.Itoa(port)),
		Handler: h,
	}

	errChan := make(chan error, 1)

	go func() {
		defer close(errChan)
		log.Printf("listening on %s", s.Addr)
		errChan <- s.ListenAndServe()
	}()
	defer s.Close()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	select {
	case <-sigChan:
	case err := <-errChan:
		if err != nil {
			log.Println(err)
		}
	}

	wait, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = s.Shutdown(wait)
}

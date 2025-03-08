package main

import (
	"bookmarks/internal/config"
	"bookmarks/internal/db"
	"bookmarks/internal/server"
	"flag"
)

func main() {
	var cfgPath string
	var port int
	flag.StringVar(&cfgPath, "config", "schedule.yaml", "config file path")
	flag.IntVar(&port, "port", 8000, "the port to bind to")

	flag.Parse()

	config := config.ParseConfig(cfgPath)
	db := db.NewDB(config.DBURL)
	db.Init()

	server.Run(port, db, config)
}
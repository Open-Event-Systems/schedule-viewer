package main

import (
	"flag"
	"oembed/internal/config"
	"oembed/internal/server"
)

func main() {
	var port int
	var configPath string
	flag.IntVar(&port, "port", 8001, "the port to listen on")
	flag.StringVar(&configPath, "config", "oembed.yaml", "the config file")

	flag.Parse()

	serverCfg := config.LoadConfig(configPath)

	server.RunServer(port, serverCfg)
}

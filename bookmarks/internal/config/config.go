package config

import (
	"os"

	"github.com/goccy/go-yaml"
)

type ScheduleConfig struct {
	URL string `json:"url"`
}

type Config struct {
	DBPath         string                    `json:"db_path"`
	TrustedProxies int                       `json:"trusted_proxies"`
	AllowedOrigins []string                  `json:"allowed_origins"`
	Schedules      map[string]ScheduleConfig `json:"schedules"`
}

func LoadConfig(path string) Config {
	var config Config

	f, err := os.Open(path)
	if err != nil {
		panic(err)
	}

	dec := yaml.NewDecoder(f)
	err = dec.Decode(&config)
	if err != nil {
		panic(err)
	}

	return config
}

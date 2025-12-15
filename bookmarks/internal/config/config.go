package config

import (
	"os"

	"github.com/goccy/go-yaml"
)

type Config struct {
	DB_URL         string            `yaml:"db_url"`
	AllowedOrigins []string          `yaml:"allowed_origins"`
	URLPrefix      string            `yaml:"url_prefix"`
	ScheduleURLs     map[string]string `yaml:"schedule_urls"`
	Secret         string            `yaml:"secret"`
}

func LoadConfig(path string) Config {
	f, err := os.Open(path)
	if err != nil {
		panic(err)
	}

	dec := yaml.NewDecoder(f)
	var config Config
	err = dec.Decode(&config)

	if err != nil {
		panic(err)
	}
	return config
}

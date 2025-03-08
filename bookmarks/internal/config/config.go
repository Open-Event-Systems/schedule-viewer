package config

import (
	"os"

	"gopkg.in/yaml.v3"
)

type Config struct {
	DBURL          string            `yaml:"db_url"`
	AllowedOrigins []string          `yaml:"allowed_origins"`
	Domain         string            `yaml:"domain"`
	ScheduleURLs   map[string]string `yaml:"schedule_urls"`
	Secret         string            `yaml:"secret"`
}

func ParseConfig(path string) *Config {
	f, err := os.Open(path)
	if err != nil {
		panic(err)
	}
	defer f.Close()

	var config *Config

	if err := yaml.NewDecoder(f).Decode(&config); err != nil {
		panic(err)
	}

	return config
}

package config

import (
	"errors"
	"os"

	"github.com/goccy/go-yaml"
)

type ScheduleConfig struct {
	URL string `json:"url"`
}

type Config struct {
	DBPath          string                    `json:"db_path"`
	TrustedProxies  int                       `json:"trusted_proxies"`
	AllowedOrigins  []string                  `json:"allowed_origins"`
	Schedules       map[string]ScheduleConfig `json:"schedules"`
	TokenSecret     string                    `json:"token_secret"`
	TokenSecretFile string                    `json:"token_secret_file"`
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

	if config.TokenSecret == "" && config.TokenSecretFile != "" {
		secretData, err := os.ReadFile(config.TokenSecretFile)
		if err != nil {
			panic(err)
		}

		config.TokenSecret = string(secretData)
	}

	if config.TokenSecret == "" {
		panic(errors.New("no token secret provided"))
	}

	return config
}

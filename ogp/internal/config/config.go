package config

import (
	"net/url"
	"os"

	"gopkg.in/yaml.v3"
)

type Config struct {
	AllowedHosts []string `yaml:"allowed_hosts"`
}

func (c *Config) IsHostAllowed(reqURL string) bool {
	urlObj, err := url.Parse(reqURL)
	if err != nil {
		return false
	}

	for _, host := range c.AllowedHosts {
		if urlObj.Host == host {
			return true
		}
	}

	return false
}

func LoadConfig(path string) *Config {
	data, err := os.ReadFile(path)
	if err != nil {
		panic(err)
	}

	config := &Config{}
	err = yaml.Unmarshal(data, config)
	if err != nil {
		panic(err)
	}
	return config
}

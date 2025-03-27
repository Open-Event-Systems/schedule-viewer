package schedule

import (
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"oembed/internal/structs"
	"strings"
)

func LoadScheduleConfig(url string) (*structs.ScheduleConfig, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var cfg structs.ScheduleConfig
	err = json.Unmarshal(body, &cfg)
	return &cfg, err
}

func LoadEvents(url string) ([]structs.Event, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var events structs.EventsResponse
	err = json.Unmarshal(body, &events)
	return events.Events, err
}

func GetConfigURL(reqURL string) string {
	urlObj, err := url.Parse(reqURL)
	if err != nil {
		return ""
	}

	if len(urlObj.Path) > 0 && urlObj.Path[len(urlObj.Path)-1] == '/' {
		urlObj.Path = urlObj.Path[:len(urlObj.Path)-1]
	}

	urlObj.Path = urlObj.Path + "/config.json"
	urlObj.Fragment = ""
	return urlObj.String()
}

func GetEventID(reqURL string) string {
	urlObj, err := url.Parse(reqURL)
	if err != nil {
		return ""
	}

	parts := strings.Split(urlObj.Fragment, "/")
	return parts[len(parts)-1]
}

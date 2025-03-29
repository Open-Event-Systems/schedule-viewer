package schedule

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"oembed/internal/structs"
	"strings"
)

func LoadScheduleConfig(url string) (*structs.ScheduleConfig, error) {
	cfg := &structs.ScheduleConfig{}
	err := loadJSON(url, cfg)
	if err != nil {
		return nil, err
	}

	return cfg, nil
}

func LoadEvents(url string) ([]structs.Event, error) {
	respBody := structs.EventsResponse{}
	err := loadJSON(url, &respBody)
	if err != nil {
		return nil, err
	}
	return respBody.Events, nil
}

func loadJSON(url string, val any) error {
	req, err := http.Get(url)
	if err != nil {
		return err
	}

	if req.StatusCode != 200 {
		return errors.New(fmt.Sprintf("unexpected status code %d when fetching %s", req.StatusCode, url))
	}

	body, err := io.ReadAll(req.Body)
	if err != nil {
		return err
	}

	return json.Unmarshal(body, val)
}

// Get an event by ID from a slice of events
func GetEvent(events []structs.Event, eventId string) (structs.Event, bool) {
	for _, event := range events {
		if event.Id == eventId {
			return event, true
		}
	}
	return structs.Event{}, false
}

// Get the config.json url from an oembed request url
func GetConfigURL(reqURL string) string {
	baseURL := GetBaseURL(reqURL)
	if baseURL == "" {
		return ""
	}

	return baseURL + "config.json"
}

// Get the event ID from a request
func GetEventID(reqURL string) string {
	urlObj, err := url.Parse(reqURL)
	if err != nil {
		return ""
	}

	parts := splitPath(urlObj.Path)
	if len(parts) >= 2 && parts[len(parts)-2] == "events" {
		return parts[len(parts)-1]
	}
	return ""
}

// Get the base url of the schedule pages
func GetBaseURL(reqURL string) string {
	urlObj, err := url.Parse(reqURL)
	if err != nil {
		return ""
	}

	basePath := ""
	match := false

	parts := splitPath(urlObj.Path)
	if len(parts) >= 2 && parts[len(parts)-2] == "events" {
		basePath = strings.Join(parts[:len(parts)-2], "/")
		match = true
	}

	if !match {
		return ""
	}

	if len(basePath) == 0 || basePath[len(basePath)-1] != '/' {
		basePath = basePath + "/"
	}

	finalURL := &url.URL{}
	*finalURL = *urlObj
	finalURL.Path = basePath
	finalURL.Fragment = ""
	finalURL.RawQuery = ""

	return finalURL.String()
}

func splitPath(path string) []string {
	parts := strings.Split(path, "/")
	filtered := make([]string, 0, len(parts))
	for _, p := range parts {
		if p != "" {
			filtered = append(filtered, p)
		}
	}
	return filtered
}

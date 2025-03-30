package data

import (
	"encoding/json"
	"io"
	"net/http"
	"oembed/internal/structs"
	"os"
	"path"

	"golang.org/x/net/html"
)

type Data struct {
	HTML   *html.Node
	Config *structs.ScheduleConfig
	Events []structs.Event
}

func LoadData(baseDir string) (*Data, error) {
	indexPath := path.Join(baseDir, "index.html")
	configPath := path.Join(baseDir, "config.json")

	htmlFile, err := os.Open(indexPath)
	if err != nil {
		return nil, err
	}
	defer htmlFile.Close()

	parsed, err := html.Parse(htmlFile)
	if err != nil {
		return nil, err
	}

	config, err := os.ReadFile(configPath)
	if err != nil {
		return nil, err
	}

	var configObj structs.ScheduleConfig
	err = json.Unmarshal(config, &configObj)
	if err != nil {
		return nil, err
	}

	var events []structs.Event

	if configObj.Events.URL != "" {
		events, err = loadEvents(configObj.Events.URL)
		if err != nil {
			return nil, err
		}
	} else {
		events = configObj.Events.Events
	}

	return &Data{HTML: parsed, Config: &configObj, Events: events}, nil
}

func loadEvents(url string) ([]structs.Event, error) {
	res, err := http.Get(url)
	if err != nil {
		return nil, err
	}

	bodyData, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	var resBody structs.EventsResponse
	err = json.Unmarshal(bodyData, &resBody)
	if err != nil {
		return nil, err
	}

	return resBody.Events, nil
}

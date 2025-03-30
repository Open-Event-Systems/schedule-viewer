package server

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"oembed/internal/config"
	"oembed/internal/oembed"
	"oembed/internal/schedule"
	"oembed/internal/structs"
	"time"

	"github.com/phuslu/lru"
)

const cacheDuration = time.Minute * 10

type cacheEntry struct {
	config *structs.ScheduleConfig
	events []structs.Event
}

func RunServer(port int, serverCfg *config.Config) {

	cache := lru.NewTTLCache[string, cacheEntry](32)

	getData := func(configURL string) (cacheEntry, error) {
		config, err := schedule.LoadScheduleConfig(configURL)
		if err != nil {
			log.Printf("could not load config %s: %s", configURL, err)
			return cacheEntry{nil, nil}, err
		}

		var events []structs.Event

		if config.Events.URL != "" {
			events, err = schedule.LoadEvents(config.Events.URL)
			if err != nil {
				log.Printf("could not load events %s: %s", config.Events.URL, err)
				return cacheEntry{nil, nil}, err
			}
		} else {
			events = config.Events.Events
		}

		return cacheEntry{config, events}, nil
	}

	getDataCached := func(ctx context.Context, configURL string) (cacheEntry, error) {
		entry, err, _ := cache.GetOrLoad(ctx, configURL, func(ctx context.Context, configURL string) (cacheEntry, time.Duration, error) {
			entry, err := getData(configURL)
			if err != nil {
				return cacheEntry{}, 0, err
			}
			return entry, cacheDuration, nil
		})
		return entry, err
	}

	mux := http.NewServeMux()

	mux.HandleFunc("GET /schedule-oembed", func(w http.ResponseWriter, req *http.Request) {
		url := req.URL.Query().Get("url")
		if url == "" {
			http.NotFound(w, req)
			return
		}

		format := req.URL.Query().Get("format")
		if format != "json" && format != "" {
			http.Error(w, http.StatusText(http.StatusNotImplemented), http.StatusNotImplemented)
			return
		}

		if !serverCfg.IsHostAllowed(url) {
			http.NotFound(w, req)
			log.Printf("domain not allowed: %s", url)
			return
		}

		configURL := schedule.GetConfigURL(url)
		if configURL == "" {
			http.NotFound(w, req)
			log.Printf("could not find config.json for %s", url)
			return
		}

		eventId := schedule.GetEventID(url)
		if eventId == "" {
			http.NotFound(w, req)
			log.Printf("could not parse event ID for %s", url)
			return
		}

		cacheEntry, err := getDataCached(req.Context(), configURL)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		event, ok := schedule.GetEvent(cacheEntry.events, eventId)
		if !ok {
			http.NotFound(w, req)
			log.Printf("no such event: %s", eventId)
			return
		}

		baseURL := schedule.GetBaseURL(url)
		providerName := cacheEntry.config.Title
		if providerName == "" {
			providerName = "Event Schedule"
		}

		oembedData := oembed.GetOEmbed(providerName, baseURL, &event)
		respData, err := json.Marshal(oembedData)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		w.Header().Add("Content-Type", "application/json+oembed")
		w.Write(respData)
	})

	log.Printf("listening on %d", port)
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), mux)
	if err != nil {
		panic(err)
	}
}

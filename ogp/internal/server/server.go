package server

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"oembed/internal/data"
	"oembed/internal/ogp"
	"oembed/internal/structs"
	"time"

	"github.com/phuslu/lru"
	"golang.org/x/net/html"
)

const cacheDuration = 1 * time.Minute

func RunServer(port int, schedulePaths map[string]string) {
	cache := lru.NewTTLCache[string, *data.Data](32)

	loadCachedData := func(ctx context.Context, path string) (*data.Data, error) {
		evData, err, _ := cache.GetOrLoad(ctx, path, func(ctx context.Context, path string) (*data.Data, time.Duration, error) {
			evData, err := data.LoadData(path)
			if err != nil {
				return nil, 0, err
			}
			return evData, cacheDuration, nil
		})
		return evData, err
	}

	handler := func(w http.ResponseWriter, req *http.Request) {
		scheduleId := req.PathValue("scheduleId")
		eventId := req.PathValue("eventId")
		origURI := req.Header.Get("X-Original-URI")
		defaultImg := req.Header.Get("X-Default-Image")
		path, ok := schedulePaths[scheduleId]
		if !ok {
			http.NotFound(w, req)
			log.Printf("no schedule with id %s", scheduleId)
			return
		}

		evData, err := loadCachedData(req.Context(), path)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			log.Printf("error loading data for %s: %s", eventId, err)
			return
		}

		event := getEvent(evData.Events, eventId)
		if event == nil {
			http.NotFound(w, req)
			log.Printf("no event for schedule %s with id %s", scheduleId, eventId)
			return
		}

		htmlDoc := ogp.CopyNode(evData.HTML)

		ogp.SetOGTags(htmlDoc, evData.Config.Title, origURI, defaultImg, event)

		w.Header().Add("Content-Type", "text/html")

		err = html.Render(w, htmlDoc)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			log.Printf("error rendering html: %s", err)
			return
		}
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /schedule-ogp/{scheduleId}/{eventId}", handler)
	mux.HandleFunc("GET /schedule-ogp/{scheduleId}/{eventId}/", handler)

	log.Printf("listening on %d", port)
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), mux)
	if err != nil {
		panic(err)
	}
}

func getEvent(events []structs.Event, id string) *structs.Event {
	for _, ev := range events {
		if ev.Id == id {
			return &ev
		}
	}
	return nil
}

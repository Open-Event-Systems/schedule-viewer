package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"oembed/internal/oembed"
	"oembed/internal/schedule"
	"oembed/internal/structs"
)

func RunServer(port int) {

	mux := http.NewServeMux()

	mux.HandleFunc("GET /{scheduleId}", func(w http.ResponseWriter, req *http.Request) {
		// scheduleId := req.PathValue("scheduleId")
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

		configUrl := schedule.GetConfigURL(url)
		if configUrl == "" {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		eventId := schedule.GetEventID(url)
		if eventId == "" {
			http.NotFound(w, req)
			return
		}

		config, err := schedule.LoadScheduleConfig(configUrl)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		events, err := schedule.LoadEvents(config.URL)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		var event *structs.Event
		for _, e := range events {
			if e.Id == eventId {
				event = &e
				break
			}
		}

		if event == nil {
			http.NotFound(w, req)
			return
		}

		oembedData := oembed.GetOEmbed(event)
		respData, err := json.Marshal(oembedData)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		w.Header().Add("Content-Type", "application/json+oembed")
		w.Write(respData)
	})

	err := http.ListenAndServe(fmt.Sprintf(":%d", port), mux)
	if err != nil {
		panic(err)
	}
}

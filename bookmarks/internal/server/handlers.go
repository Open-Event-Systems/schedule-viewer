package server

import (
	"bookmarks/internal/config"
	"bookmarks/internal/db"
	"bookmarks/internal/selection"
	"bookmarks/internal/structs"
	"bookmarks/internal/validator"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"slices"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/phuslu/lru"
)

type server struct {
	db         *db.DB
	config     *config.Config
	validator  *validator.Validator
	countCache *lru.TTLCache[string, map[string]int]
}

var emptySelectionResponse = func() *structs.SessionBookmarksResponse {
	sel := selection.NewSelection([]string{})
	return &structs.SessionBookmarksResponse{
		Id:     sel.Hash(),
		Date:   time.Unix(0, 0).Format(time.RFC3339),
		Events: sel.GetEventIds(),
	}
}()

func (s *server) getSelectionHandler(w http.ResponseWriter, req *http.Request) {
	scheduleId := chi.URLParam(req, "scheduleId")
	hash := chi.URLParam(req, "hash")

	sel, err := s.db.GetSelection(scheduleId, hash)
	if err != nil {
		http.NotFound(w, req)
		return
	}

	resp := structs.BookmarksResponse{
		Id: hash, Events: sel.GetEventIds(),
	}
	jsonResponse(w, resp)
}

func (s *server) setupSessionHandler(w http.ResponseWriter, req *http.Request) {
	scheduleId := chi.URLParam(req, "scheduleId")
	if _, ok := s.config.ScheduleURLs[scheduleId]; !ok {
		httpError(w, http.StatusNotFound)
		return
	}

	sessionReq := structs.BookmarkSetupRequest{}

	body, err := io.ReadAll(req.Body)
	if err != nil {
		httpError(w, http.StatusBadRequest)
		return
	}

	var sessionId sessionId

	if len(body) > 0 {
		err = json.Unmarshal(body, &sessionReq)
		if err != nil {
			httpError(w, http.StatusUnprocessableEntity)
			return
		}

		sessionId, err = verifySessionId(sessionReq.SessionID, s.config.Secret)
	} else {
		sessionId, err = getSessionIdFromCookie(req, s.config.Secret, scheduleId)
	}

	if err != nil {
		sessionId = newSessionId(s.config.Secret)
	}

	sessionId.SetCookie(w, s.config.Domain, scheduleId)
	resp := structs.BookmarkSetupResponse{
		SessionID: sessionId.String(),
	}
	jsonResponse(w, resp)
}

func (s *server) setSelectionHandler(w http.ResponseWriter, req *http.Request) {
	scheduleId := chi.URLParam(req, "scheduleId")

	var reqBody structs.BookmarksRequest
	if err := json.NewDecoder(req.Body).Decode(&reqBody); err != nil {
		httpError(w, http.StatusUnprocessableEntity)
		return
	}

	sessionId, err := getSessionIdFromCookie(req, s.config.Secret, scheduleId)
	if err != nil {
		httpError(w, http.StatusUnauthorized)
		return
	}

	validatedEvents, err := s.validator.ValidateEvents(scheduleId, reqBody.Events)
	if err == validator.ErrNoSchedule {
		http.NotFound(w, req)
		return
	} else if err != nil {
		log.Println(err)
		httpError(w, http.StatusInternalServerError)
		return
	}

	sel := selection.NewSelection(validatedEvents)

	hash, err := s.db.SaveSelection(scheduleId, sel)
	if err != nil {
		panic(err)
	}

	date, err := s.db.SetSessionSelection(sessionId.Id, scheduleId, hash)
	if err != nil {
		panic(err)
	}

	sessionId.SetCookie(w, s.config.Domain, scheduleId)

	respBody := structs.SessionBookmarksResponse{
		Id:     hash,
		Date:   date,
		Events: sel.GetEventIds(),
	}
	jsonResponse(w, respBody)
}

func (s *server) getSessionSelectionHandler(w http.ResponseWriter, req *http.Request) {
	scheduleId := chi.URLParam(req, "scheduleId")

	sessionId, err := getSessionIdFromCookie(req, s.config.Secret, scheduleId)
	if err != nil {
		jsonResponse(w, emptySelectionResponse)
		return
	}

	selections, date, err := s.db.GetSessionSelection(sessionId.Id, scheduleId)
	if err != nil {
		httpError(w, http.StatusInternalServerError)
		return
	}
	if selections == nil {
		jsonResponse(w, emptySelectionResponse)
		return
	}

	respBody := &structs.SessionBookmarksResponse{
		Id:     selections.Hash(),
		Date:   date,
		Events: selections.GetEventIds(),
	}
	jsonResponse(w, respBody)
}

func (s *server) getEventSelectionCountsHandler(w http.ResponseWriter, req *http.Request) {
	scheduleId := chi.URLParam(req, "scheduleId")

	res, err := s.getSelectionCounts(req.Context(), scheduleId)
	if err != nil {
		httpError(w, http.StatusInternalServerError)
		return
	}

	if res == nil {
		httpError(w, http.StatusNotFound)
		return
	}

	respBody := structs.EventSelectionCountsResponse{
		Counts: res,
	}
	jsonResponse(w, respBody)
}

func (s *server) getEventSelectionCountsHTMLHandler(w http.ResponseWriter, req *http.Request) {
	scheduleId := chi.URLParam(req, "scheduleId")

	res, err := s.getSelectionCounts(req.Context(), scheduleId)
	if err != nil {
		httpError(w, http.StatusInternalServerError)
		return
	}

	if res == nil {
		httpError(w, http.StatusNotFound)
		return
	}

	type entryT struct {
		id    string
		count int
	}

	entries := make([]entryT, 0, len(res))

	for id, ct := range res {
		entries = append(entries, entryT{id, ct})
	}

	slices.SortFunc(entries, func(a entryT, b entryT) int {
		return b.count - a.count
	})

	w.Header().Add("Content-Type", "text/html")
	w.Write([]byte("<!DOCTYPE html><html><head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />"))
	w.Write([]byte("<title>Bookmark Counts</title></head><body>"))
	w.Write([]byte("<table><thead><tr><th scope=\"col\">Event ID</th><th scope=\"col\">Count</th></tr></thead><tbody>"))

	for _, entry := range entries {
		w.Write([]byte(fmt.Sprintf("<tr><td>%s</td><td>%d</td></tr>", entry.id, entry.count)))
	}

	w.Write([]byte("</tbody></table></body></html>"))
}

func (s *server) getSelectionCounts(ctx context.Context, scheduleId string) (map[string]int, error) {
	if _, ok := s.config.ScheduleURLs[scheduleId]; !ok {
		return nil, nil
	}

	res, err, _ := s.countCache.GetOrLoad(ctx, scheduleId, func(ctx context.Context, key string) (map[string]int, time.Duration, error) {
		res, err := s.db.GetEventSelectionCounts(key)
		if err != nil {
			return nil, 0, err
		}

		return res, 60 * time.Second, nil
	})

	return res, err
}

package server

import (
	"bookmarks/internal/bookmarks"
	"bookmarks/internal/db"
	"bookmarks/internal/schedule"
	"context"
	"database/sql"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/phuslu/lru"
)

type Handlers struct {
	db              *sql.DB
	secret          string
	urlPrefix       string
	emptySels       *bookmarks.Selections
	configURLs      map[string]string
	scheduleService *schedule.ScheduleService
	cache           *lru.TTLCache[string, map[string]struct{}]
}

type setupSessionRequestBody struct {
	SessionId string `json:"sessionId"`
}

type setupSessionResponseBody struct {
	SessionId string `json:"sessionId"`
}

type selectionsJSON struct {
	Id    string     `json:"id,omitempty"`
	Date  *time.Time `json:"date,omitempty"`
	Items []string   `json:"items"`
}

type selectionsRequestBody struct {
	Selections selectionsJSON `json:"selections"`
}

type selectionsResponseBody struct {
	Selections selectionsJSON `json:"selections"`
}

type sessionSelectionsJSON struct {
	Id   string     `json:"id"`
	Date *time.Time `json:"date,omitempty"`
	URL  string     `json:"url"`
}

type sessionSelectionsResponseBody struct {
	SessionSelections sessionSelectionsJSON `json:"sessionSelections"`
}

const itemsCacheDuration = 2 * time.Minute

func NewHandlers(db *sql.DB, urlPrefix string, allowedOrigins []string, configURLs map[string]string, secret string) http.Handler {
	h := &Handlers{
		db:              db,
		secret:          secret,
		urlPrefix:       urlPrefix,
		emptySels:       bookmarks.NewSelections(nil),
		scheduleService: schedule.NewScheduleService(),
		configURLs:      configURLs,
	}

	h.cache = lru.NewTTLCache(len(h.configURLs), lru.WithLoader[string, map[string]struct{}](func(ctx context.Context, key string) (value map[string]struct{}, ttl time.Duration, err error) {
		configURL := h.configURLs[key]
		ids, err := h.scheduleService.GetValidIds(ctx, configURL)
		return ids, itemsCacheDuration, err
	}))

	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: allowedOrigins,
		MaxAge:         3600,
		AllowedMethods: []string{"HEAD", "GET", "PUT", "POST"},
		AllowedHeaders: []string{"Authorization"},
	}))

	r.Route("/schedules/{scheduleId}", func(r chi.Router) {
		r.Use(h.scheduleIdValidator)
		r.Post("/setup-session", h.handleSetupSession)
		r.Get("/selections/{selectionsId}", h.handleGetSelections)
		r.Put("/bookmarks", h.handleSetSessionSelections)
		r.Get("/bookmarks", h.handleGetSessionSelections)
	})

	var handler http.Handler

	if urlPrefix != "" {
		outer := chi.NewRouter()
		outer.Mount(urlPrefix, r)
		handler = outer
	} else {
		handler = r
	}

	return handler
}

func (h *Handlers) handleSetupSession(w http.ResponseWriter, req *http.Request) {
	scheduleId := chi.URLParam(req, "scheduleId")
	// TODO: validate scheduleId

	var body setupSessionRequestBody
	err := readJSONBody(req, &body)
	if err != nil && err != io.EOF {
		httpError(w, http.StatusBadRequest)
		return
	}

	var session SessionToken

	if body.SessionId != "" {
		session, err = DecodeSession(body.SessionId, h.secret)
		if err != nil || session.ScheduleId != scheduleId {
			session = NewSession(scheduleId)
		}
	} else {
		session = NewSession(scheduleId)
	}

	sessionIdStr := session.Encode(h.secret)

	jsonResponse(w, setupSessionResponseBody{SessionId: sessionIdStr})
}

func (h *Handlers) handleGetSelections(w http.ResponseWriter, req *http.Request) {
	scheduleId := chi.URLParam(req, "scheduleId")
	selsId := chi.URLParam(req, "selectionsId")

	// special case the empty selections set
	if selsId == h.emptySels.Id() {
		w.Header().Set("Cache-Control", "public, max-age=604800")
		jsonResponse(w, selectionsResponseBody{
			Selections: selectionsJSON{
				Id:    h.emptySels.Id(),
				Items: h.emptySels.Slice(),
			},
		})
		return
	}

	var resp selectionsResponseBody

	commit, _ := withDB(h.db, req.Context(), scheduleId, func(db *db.DB) (bool, error) {
		sels, err := db.GetSelections(selsId)
		if err != nil {
			serverError(w, err)
			return false, err
		}

		if sels.Len() == 0 {
			httpError(w, http.StatusNotFound)
			return false, nil
		}

		resp.Selections.Id = sels.Id()
		resp.Selections.Items = sels.Slice()
		return true, nil
	})

	if commit {
		w.Header().Set("Cache-Control", "public, max-age=604800")
		jsonResponse(w, resp)
	}
}

func (h *Handlers) handleSetSessionSelections(w http.ResponseWriter, req *http.Request) {
	scheduleId := chi.URLParam(req, "scheduleId")

	sess, err := h.validateSession(req, scheduleId)
	if err != nil {
		httpError(w, http.StatusUnauthorized)
		return
	}

	var body selectionsRequestBody
	err = readJSONBody(req, &body)
	if err != nil {
		httpError(w, http.StatusBadRequest)
		return
	}

	validItemIds, err := h.getValidItemIds(req.Context(), scheduleId)
	if err != nil {
		serverError(w, fmt.Errorf("failed to load schedule item ids for %s: %w", scheduleId, err))
		return
	}

	sels := bookmarks.NewSelections(func(yield func(id string) bool) {
		for _, id := range body.Selections.Items {
			if _, ok := validItemIds[id]; ok {
				if !yield(id) {
					return
				}
			}
		}
	})

	id := sels.Id()

	var resp sessionSelectionsResponseBody

	commit, _ := withDB(h.db, req.Context(), scheduleId, func(db *db.DB) (bool, error) {
		exists, err := db.GetSelectionsExist(id)
		if err != nil {
			return false, err
		}

		// save the selections if they don't already exist (and it's not the empty set)
		if !exists && sels.Len() > 0 {
			err := db.SetSelections(sels)
			if err != nil {
				serverError(w, err)
				return false, err
			}
		}

		now := time.Now()

		err = db.SetSessionSelectionId(sess.Subject, id, now, "TODO", "TODO")
		if err != nil {
			serverError(w, err)
			return false, err
		}

		resp.SessionSelections.Id = id
		resp.SessionSelections.Date = &now
		resp.SessionSelections.URL = getSelectionsURL(h.urlPrefix, req, scheduleId, id)

		return true, nil
	})

	if commit {
		jsonResponse(w, resp)
	}
}

func (h *Handlers) handleGetSessionSelections(w http.ResponseWriter, req *http.Request) {
	scheduleId := chi.URLParam(req, "scheduleId")

	sess, err := h.validateSession(req, scheduleId)
	if err != nil {
		httpError(w, http.StatusUnauthorized)
		return
	}

	var resp sessionSelectionsResponseBody

	commit, _ := withDB(h.db, req.Context(), scheduleId, func(db *db.DB) (bool, error) {
		id, date, err := db.GetSessionSelectionId(sess.Subject)
		if err != nil {
			serverError(w, err)
			return false, err
		}

		if id == "" {
			resp.SessionSelections.Id = h.emptySels.Id()
			resp.SessionSelections.URL = getSelectionsURL(h.urlPrefix, req, scheduleId, h.emptySels.Id())
			return true, nil
		}

		resp.SessionSelections.Id = id
		resp.SessionSelections.Date = &date
		resp.SessionSelections.URL = getSelectionsURL(h.urlPrefix, req, scheduleId, id)

		return true, nil
	})

	if commit {
		jsonResponse(w, resp)
	}
}

func (h *Handlers) scheduleIdValidator(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		scheduleId := chi.URLParam(r, "scheduleId")

		if _, ok := h.configURLs[scheduleId]; !ok {
			http.NotFound(w, r)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (h *Handlers) getValidItemIds(ctx context.Context, scheduleId string) (map[string]struct{}, error) {
	items, err, _ := h.cache.GetOrLoad(ctx, scheduleId, nil)
	return items, err
}

func (h *Handlers) validateSession(req *http.Request, scheduleId string) (SessionToken, error) {
	var session SessionToken

	header := req.Header.Get("Authorization")
	typ, val, found := strings.Cut(header, " ")
	if !found || strings.ToLower(typ) != "bearer" {
		return session, ErrInvalidSessionId
	}

	session, err := DecodeSession(strings.TrimSpace(val), h.secret)
	if err != nil {
		return session, err
	}

	if session.ScheduleId != scheduleId {
		return session, ErrInvalidSessionId
	}

	return session, nil
}

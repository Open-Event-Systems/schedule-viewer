package server

import (
	"bookmarks/internal/models"
	"bookmarks/internal/selections"
	"bookmarks/internal/sessiontoken"
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/maypok86/otter/v2"
	"gorm.io/gorm"
)

type countsEntry struct {
	counts map[string]int
	time   time.Time
}

type handlers struct {
	conn            *gorm.DB
	tokenService    *sessiontoken.SessionTokenService
	emptySelections selections.Selections
	countCache      *otter.Cache[string, countsEntry]
}

type ContextKey string

const SessionIdKey ContextKey = "sessionId"

const CountsCacheSeconds = 30

func NewHandler(conn *gorm.DB, tokenSecret string) http.Handler {
	handlers := &handlers{
		conn:            conn,
		tokenService:    sessiontoken.NewSessionTokenService(tokenSecret),
		emptySelections: selections.NewSelections(),
	}

	// TODO: get schedule count
	handlers.countCache = otter.Must(&otter.Options[string, countsEntry]{
		MaximumSize:      1,
		InitialCapacity:  1,
		ExpiryCalculator: otter.ExpiryWriting[string, countsEntry](CountsCacheSeconds * time.Second),
	})

	r := chi.NewRouter()

	r.Route("/schedules/{scheduleId}", func(r chi.Router) {
		r.Use(handlers.validateScheduleId)
		r.Post("/setup-session", handlers.setupSession)

		r.Get("/selections/{selectionsId}", handlers.getSelections)
		r.Get("/counts", handlers.getCounts)
		r.Get("/counts.html", handlers.getHTMLCounts)

		r.Route("/session-selections/{type}", func(r chi.Router) {
			r.Use(handlers.validateType)
			r.Use(handlers.validateSessionId)
			r.Get("/", handlers.getSessionSelections)
			r.Put("/", handlers.setSessionSelections)
		})
	})

	return r
}

func (h *handlers) validateScheduleId(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		scheduleId := chi.URLParam(r, "scheduleId")

		// TODO: validate
		if scheduleId == "" {
			httpError(w, http.StatusNotFound)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (h *handlers) validateSessionId(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		scheduleIdParam := chi.URLParam(r, "scheduleId")
		authHeader := r.Header.Get("Authorization")
		typ, val, found := strings.Cut(authHeader, " ")
		if !found || strings.ToLower(typ) != "bearer" || val == "" {
			httpError(w, http.StatusUnauthorized)
			return
		}

		scheduleId, sessionId, err := h.tokenService.ValidateToken(val)
		if err != nil || scheduleId != scheduleIdParam {
			httpError(w, http.StatusUnauthorized)
			return
		}

		ctx := r.Context()
		withSessionId := context.WithValue(ctx, SessionIdKey, sessionId)

		next.ServeHTTP(w, r.WithContext(withSessionId))
	})
}

func (h *handlers) validateType(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		typ := models.SessionSelectionsType(chi.URLParam(r, "type"))
		if typ != models.Bookmarks && typ != models.Visited {
			httpError(w, http.StatusNotFound)
			return
		}

		next.ServeHTTP(w, r)
	})
}

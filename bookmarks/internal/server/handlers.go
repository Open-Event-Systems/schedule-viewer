package server

import (
	"bookmarks/internal/config"
	"bookmarks/internal/models"
	"bookmarks/internal/schedule"
	"bookmarks/internal/selections"
	"bookmarks/internal/sessiontoken"
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/maypok86/otter/v2"
	"gorm.io/gorm"

	"github.com/go-chi/cors"
)

type countsEntry struct {
	counts map[string]int
	time   time.Time
}

type handlers struct {
	conn              *gorm.DB
	tokenService      *sessiontoken.SessionTokenService
	scheduleService   *schedule.ScheduleService
	emptySelections   selections.Selections
	countCache        *otter.Cache[string, countsEntry]
	trustedProxyCount int
}

type ContextKey string

const SessionIdKey ContextKey = "sessionId"

const CountsCacheSeconds = 300

func NewHandler(cfg config.Config, conn *gorm.DB, tokenSecret string) http.Handler {
	handlers := &handlers{
		conn:              conn,
		tokenService:      sessiontoken.NewSessionTokenService(tokenSecret),
		scheduleService:   schedule.NewScheduleService(cfg.Schedules),
		emptySelections:   selections.NewSelections(),
		trustedProxyCount: cfg.TrustedProxies,
	}

	handlers.countCache = otter.Must(&otter.Options[string, countsEntry]{
		MaximumSize:      len(cfg.Schedules) * 2,
		InitialCapacity:  len(cfg.Schedules) * 2,
		ExpiryCalculator: otter.ExpiryWriting[string, countsEntry](CountsCacheSeconds * time.Second),
	})

	r := chi.NewRouter()

	r.Use(realIP(cfg.TrustedProxies))
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.AllowedOrigins,
		AllowedMethods:   []string{"GET", "HEAD", "POST", "PUT"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Content-Type"},
		AllowCredentials: true,
		MaxAge:           7200,
	}))

	r.Route("/schedules/{scheduleId}", func(r chi.Router) {
		r.Use(handlers.validateScheduleId(cfg.Schedules))

		r.Post("/setup-session", handlers.setupSession)

		r.Get("/selections/{selectionsId}", handlers.getSelections)

		// counts routes
		r.Group(func(r chi.Router) {
			r.Use(handlers.validateType)
			r.Get("/counts/{type}", handlers.getCounts)
			r.Get("/counts/{type}.html", handlers.getHTMLCounts)
		})

		// routes that require a session
		r.Group(func(r chi.Router) {
			r.Use(handlers.validateSessionId)

			r.Route("/session-selections/{type}", func(r chi.Router) {
				r.Use(handlers.validateType)
				r.Get("/", handlers.getSessionSelections)
				r.Put("/", handlers.setSessionSelections)
			})
		})
	})

	return r
}

func (h *handlers) validateScheduleId(scheduleCfg map[string]config.ScheduleConfig) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			scheduleId := chi.URLParam(r, "scheduleId")
			_, ok := scheduleCfg[scheduleId]

			if !ok {
				httpError(w, http.StatusNotFound)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
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

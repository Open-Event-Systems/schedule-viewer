package server

import (
	"bookmarks/internal/config"
	"bookmarks/internal/db"
	"bookmarks/internal/validator"
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/phuslu/lru"
)

func Run(port int, db *db.DB, config *config.Config) {

	serverCfg := server{
		db:         db,
		config:     config,
		validator:  validator.NewValidator(config.ScheduleURLs),
		countCache: lru.NewTTLCache[string, map[string]int](16),
	}

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   config.AllowedOrigins,
		AllowedMethods:   []string{"GET", "PUT", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Route("/schedule/{scheduleId}", func(r chi.Router) {
		r.Put("/setup-bookmarks", serverCfg.setupSessionHandler)
		r.Route("/bookmarks", func(r chi.Router) {
			r.Get("/", serverCfg.getSessionSelectionHandler)
			r.Put("/", serverCfg.setSelectionHandler)
			r.Get("/{hash}", serverCfg.getSelectionHandler)
		})
		r.Get("/counts", serverCfg.getEventSelectionCountsHandler)
	})

	server := &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: r,
	}

	log.Println("server starting")
	if err := server.ListenAndServe(); err != nil {
		panic(err)
	}
}

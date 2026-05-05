package handler

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"ogp/internal/sitemap"
	"ogp/internal/tags"
	"ogp/internal/tags/jsonld"
	"ogp/internal/tags/meta"
	"ogp/internal/tags/ogp"
	"strconv"
	"strings"
	"sync"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/open-event-systems/schedule-viewer/lib/go/client"
	"github.com/open-event-systems/schedule-viewer/lib/go/schedule"
	"golang.org/x/net/html"
)

type Handler struct {
	httpClient     http.Client
	scheduleClient *client.Client
	r              *chi.Mux
}

type headerOptions struct {
	url       string
	htmlURL   string
	configURL string
}

func NewHandler() *Handler {
	h := &Handler{
		scheduleClient: client.NewClient(),
	}

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.GetHead)

	r.Get("/", h.handleIndex)
	r.Get("/sitemap.xml", h.handleSitemap)
	r.Get("/items/{itemId}", h.handleItemRoute)

	h.r = r

	return h
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	h.r.ServeHTTP(w, r)
}

func (h *Handler) handleIndex(w http.ResponseWriter, r *http.Request) {
	opts, err := getHeaderOptions(r)

	if err != nil {
		httpError(w, http.StatusBadRequest)
		log.Printf("bad request: %s", err)
		return
	}

	if opts.url == "" {
		serverError(w, errors.New("X-Schedule-URL was not set"))
		return
	}

	if opts.htmlURL == "" {
		serverError(w, errors.New("X-Schedule-HTML-URL was not set"))
		return
	}

	if opts.configURL == "" {
		serverError(w, errors.New("X-Schedule-Config-URL was not set"))
		return
	}

	htmlStr, respHeaders, config, items, err := h.fetchData(r.Context(), opts.htmlURL, opts.configURL)
	if err != nil {
		serverError(w, err)
		return
	}

	for k, v := range respHeaders {
		for _, vs := range v {
			w.Header().Set(k, vs)
		}
	}

	doc, err := html.Parse(bytes.NewBufferString(htmlStr))
	if err != nil {
		serverError(w, err)
		return
	}

	ctx := tags.TagContext{
		Config:         config,
		AddressEntries: config.LocationAddresses,
		URL:            removeTrailingSlash(opts.url),
	}

	ctx.Apply(doc, jsonld.GetIndexTagActions(ctx, items))

	buf := bytes.NewBuffer(nil)

	err = html.Render(buf, doc)
	if err != nil {
		serverError(w, err)
		return
	}

	w.Header().Set("Content-Length", strconv.Itoa(buf.Len()))
	buf.WriteTo(w)
}

func (h *Handler) handleSitemap( w http.ResponseWriter, r *http.Request) {
	opts, err := getHeaderOptions(r)

	if err != nil {
		httpError(w, http.StatusBadRequest)
		log.Printf("bad request: %s", err)
		return
	}


	_, _, _, items, err := h.fetchData(r.Context(), opts.htmlURL, opts.configURL)
	if err != nil {
		serverError(w, err)
		return
	}

	buf := bytes.NewBuffer(nil)
	if err = sitemap.WriteSiteMap(buf, opts.url, items); err != nil {
		serverError(w, err)
		return
	}


	w.Header().Set("Content-Type", "application/xml")
	w.Header().Set("Content-Length", strconv.Itoa(buf.Len()))

	buf.WriteTo(w)
}

func (h *Handler) handleItemRoute(w http.ResponseWriter, r *http.Request) {
	itemId := chi.URLParam(r, "itemId")
	opts, err := getHeaderOptions(r)

	if err != nil {
		httpError(w, http.StatusBadRequest)
		log.Printf("bad request: %s", err)
		return
	}

	if opts.url == "" {
		serverError(w, errors.New("X-Schedule-URL was not set"))
		return
	}

	if opts.htmlURL == "" {
		serverError(w, errors.New("X-Schedule-HTML-URL was not set"))
		return
	}

	if opts.configURL == "" {
		serverError(w, errors.New("X-Schedule-Config-URL was not set"))
		return
	}

	htmlStr, respHeaders, config, items, err := h.fetchData(r.Context(), opts.htmlURL, opts.configURL)
	if err != nil {
		serverError(w, err)
		return
	}

	for k, v := range respHeaders {
		for _, vs := range v {
			w.Header().Set(k, vs)
		}
	}

	var item *schedule.Item

	for i := range items {
		if items[i].Id == itemId {
			item = &items[i]
			break
		}
	}

	if item == nil {
		w.Header().Set("Content-Length", strconv.Itoa(len(htmlStr)))
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte(htmlStr))
		return
	}

	doc, err := html.Parse(bytes.NewBufferString(htmlStr))
	if err != nil {
		serverError(w, err)
		return
	}

	ctx := tags.TagContext{
		Config:         config,
		Item:           item,
		AddressEntries: config.LocationAddresses,
	}

	switch item.Type {
	case "event":
		ctx.URL = fmt.Sprintf("%s/events/%s", removeTrailingSlash(opts.url), item.Id)
	case "vendor":
		ctx.URL = fmt.Sprintf("%s/vendors/%s", removeTrailingSlash(opts.url), item.Id)
	}

	ctx.Apply(doc, meta.GetItemTagActions(ctx), ogp.GetBaseTagActions(ctx), ogp.GetItemTagActions(ctx), jsonld.GetItemTagActions(ctx))

	buf := bytes.NewBuffer(nil)

	err = html.Render(buf, doc)
	if err != nil {
		serverError(w, err)
		return
	}

	w.Header().Set("Content-Length", strconv.Itoa(buf.Len()))
	buf.WriteTo(w)
}

func (h *Handler) fetchData(ctx context.Context, htmlURL string, configURL string) (html string, respHeaders http.Header, config schedule.Config, items []schedule.Item, err error) {
	wg := sync.WaitGroup{}

	var htmlErr error
	var configErr error
	var itemsErr error

	wg.Go(func() {
		var req *http.Request
		req, htmlErr = http.NewRequestWithContext(ctx, "GET", htmlURL, nil)
		if htmlErr != nil {
			return
		}

		var resp *http.Response
		resp, htmlErr = h.httpClient.Do(req)
		if htmlErr != nil {
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != 200 {
			htmlErr = fmt.Errorf("unexpected http status %d", resp.StatusCode)
			return
		}

		respHeaders = resp.Header

		sb := strings.Builder{}
		_, htmlErr = io.Copy(&sb, resp.Body)

		html = sb.String()
	})

	wg.Go(func() {
		config, configErr = h.scheduleClient.GetConfig(ctx, configURL)

		if configErr != nil {
			return
		}

		items, itemsErr = h.scheduleClient.GetItems(ctx, config.Items)
	})

	wg.Wait()

	err = errors.Join(htmlErr, configErr, itemsErr)
	return
}

func getHeaderOptions(r *http.Request) (headerOptions, error) {
	var opts headerOptions
	var errs []error

	opts.url = r.Header.Get("X-Schedule-URL")
	opts.htmlURL = r.Header.Get("X-Schedule-HTML-URL")
	opts.configURL = r.Header.Get("X-Schedule-Config-URL")

	if opts.url == "" {
		errs = append(errs, errors.New("header X-Schedule-URL was not set"))
	}

	if opts.htmlURL == "" {
		errs = append(errs, errors.New("header X-Schedule-HTML-URL was not set"))
	}

	if opts.configURL == "" {
		errs = append(errs, errors.New("header X-Schedule-Config-URL was not set"))
	}

	return opts, errors.Join(errs...)
}

func serverError(w http.ResponseWriter, err error) {
	log.Printf("unhandled error: %s", err)
	httpError(w, http.StatusInternalServerError)
}

func httpError(w http.ResponseWriter, status int) {
	http.Error(w, http.StatusText(status), status)
}

func removeTrailingSlash(s string) string {
	if strings.HasSuffix(s, "/") {
		return s[:len(s)-1]
	}
	return s
}

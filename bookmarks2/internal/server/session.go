package server

import (
	"bookmarks/internal/models"
	"bookmarks/internal/selections"
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/goccy/go-json"
	"github.com/maypok86/otter/v2"
	"gorm.io/gorm"
)

type sessionBody struct {
	SessionId string `json:"session_id"`
}

type sessionSelectionsRequest struct {
	Selections *selections.Selections `json:"selections"`
	Add        []string               `json:"add"`
	Remove     []string               `json:"remove"`
}

type sessionSelectionsObject struct {
	Selections selections.Selections `json:"selections"`
	Date       *models.ISOTime       `json:"date,omitempty"`
	URL        string                `json:"url,omitempty"`
}

type sessionSelectionsResponse struct {
	SessionSelections sessionSelectionsObject `json:"session_selections"`
}

type bookmarkCountsResponse struct {
	Counts map[string]int `json:"counts"`
}

func (h *handlers) setupSession(w http.ResponseWriter, r *http.Request) {
	reqScheduleId := chi.URLParam(r, "scheduleId")
	var reqBody sessionBody
	dec := json.NewDecoder(r.Body)
	err := dec.Decode(&reqBody)
	if err == io.EOF {
		// no content
	} else if err != nil {
		httpError(w, http.StatusBadRequest)
		return
	}

	ip, partialIP := getSessionIPs(r.RemoteAddr)
	var scheduleId, sessionId string

	err = h.withTx(r.Context(), func(db *models.DB) error {
		sessionValid := false

		if reqBody.SessionId != "" {
			scheduleId, sessionId, err = h.tokenService.ValidateToken(reqBody.SessionId)
			if err != nil {
				log.Printf("invalid session: %s", err)
			} else {
				n, err := db.UpdateSession(scheduleId, sessionId, ip, partialIP)
				if err != nil {
					serverError(w, err)
					return err
				}

				if n > 0 {
					sessionValid = true
				}
			}
		}

		if !sessionValid {
			// create new
			newSess, err := db.CreateSession(models.Session{ScheduleId: reqScheduleId, IP: ip, PartialIP: partialIP})
			if err != nil {
				serverError(w, err)
				return err
			}

			sessionId = newSess.Id
			scheduleId = newSess.ScheduleId
		}

		return nil
	})

	if err == nil {
		jsonResponse(w, sessionBody{
			SessionId: h.tokenService.CreateToken(scheduleId, sessionId),
		})
	}
}

func (h *handlers) getSessionSelections(w http.ResponseWriter, r *http.Request) {
	scheduleId := chi.URLParam(r, "scheduleId")
	sessionId := r.Context().Value(SessionIdKey).(string)
	typ := chi.URLParam(r, "type")

	var sels selections.Selections
	selDate := models.ISOTime{Time: time.Unix(0, 0)}

	err := h.withTx(r.Context(), func(db *models.DB) error {
		ssels, err := db.GetSessionSelections(scheduleId, sessionId, models.SessionSelectionsType(typ))
		if errors.Is(err, gorm.ErrRecordNotFound) {
			sels = selections.NewSelections()
			return nil
		} else if err != nil {
			serverError(w, err)
			return err
		}

		sels, err = db.GetSelections(scheduleId, ssels.SelectionsId)
		selDate = ssels.UpdatedAt
		return err
	})

	if err == nil {
		curURL := getFullURL(r)
		pathParts := strings.Split(curURL.Path, "/")
		if pathParts[len(pathParts)-1] == "" {
			pathParts = pathParts[:len(pathParts)-1]
		}
		newParts := pathParts[:len(pathParts)-2]
		newParts = append(newParts, "selections", sels.Id())
		curURL.Path = strings.Join(newParts, "/")

		resp := sessionSelectionsResponse{
			SessionSelections: sessionSelectionsObject{
				Selections: sels,
				Date:       &selDate,
				URL:        curURL.String(),
			},
		}

		jsonResponse(w, resp)
	}
}

func (h *handlers) setSessionSelections(w http.ResponseWriter, r *http.Request) {
	scheduleId := chi.URLParam(r, "scheduleId")
	sessionId := r.Context().Value(SessionIdKey).(string)
	typ := models.SessionSelectionsType(chi.URLParam(r, "type"))

	var reqBody sessionSelectionsRequest
	if err := jsonBody(w, r, &reqBody); err != nil {
		return
	}

	add, err := h.validateIds(r.Context(), scheduleId, reqBody.Add)
	if err != nil {
		serverError(w, err)
		return
	}

	if reqBody.Selections != nil {
		selIds, err := h.validateIds(r.Context(), scheduleId, reqBody.Selections.Slice())
		if err != nil {
			serverError(w, err)
			return
		}

		validSels := selections.NewSelections(selIds...)
		reqBody.Selections = &validSels
	}

	var sels selections.Selections
	var ssels models.SessionSelections

	err = h.withTx(r.Context(), func(db *models.DB) error {
		if reqBody.Selections != nil {
			// provided selections
			sels = *reqBody.Selections
		} else {
			// omitted, so get current selections from db
			ssels, err = db.GetSessionSelections(scheduleId, sessionId, typ)
			if errors.Is(err, gorm.ErrRecordNotFound) {
				sels = h.emptySelections
			} else if err != nil {
				serverError(w, err)
				return err
			} else {
				if sels, err = db.GetSelections(ssels.ScheduleId, ssels.SelectionsId); err != nil {
					serverError(w, err)
					return err
				}
			}
		}

		// update selections
		sels = sels.Add(add...)
		sels = sels.Remove(reqBody.Remove...)

		if !sels.Equal(h.emptySelections) {
			if err = db.SetSelections(scheduleId, sels); err != nil {
				serverError(w, err)
				return err
			}
		}

		if ssels, err = db.SetSessionSelections(scheduleId, sessionId, typ, sels.Id()); err != nil {
			serverError(w, err)
			return err
		}

		return nil
	})

	if err == nil {
		curURL := getFullURL(r)
		pathParts := strings.Split(curURL.Path, "/")
		if pathParts[len(pathParts)-1] == "" {
			pathParts = pathParts[:len(pathParts)-1]
		}
		newParts := pathParts[:len(pathParts)-2]
		newParts = append(newParts, "selections", ssels.SelectionsId)
		curURL.Path = strings.Join(newParts, "/")

		resp := sessionSelectionsResponse{
			SessionSelections: sessionSelectionsObject{
				Selections: sels,
				Date:       &ssels.UpdatedAt,
				URL:        curURL.String(),
			},
		}

		jsonResponse(w, resp)
	}
}

func (h *handlers) getCountsEntry(ctx context.Context, scheduleId string) (countsEntry, error) {
	loader := func(ctx context.Context, key string) (countsEntry, error) {
		var results map[string]int
		var err error
		err = h.withTx(ctx, func(db *models.DB) error {
			results, err = db.GetBookmarkCounts(scheduleId)
			return err
		})

		return countsEntry{counts: results, time: time.Now()}, err
	}

	return h.countCache.Get(ctx, scheduleId, otter.LoaderFunc[string, countsEntry](loader))
}

func (h *handlers) getCounts(w http.ResponseWriter, r *http.Request) {
	scheduleId := chi.URLParam(r, "scheduleId")

	results, err := h.getCountsEntry(r.Context(), scheduleId)

	if err == nil {
		now := time.Now()
		age := int(now.Sub(results.time).Seconds())
		w.Header().Set("Cache-Control", fmt.Sprintf("public, max-age=%d", CountsCacheSeconds))
		w.Header().Set("Age", strconv.Itoa(age))
		jsonResponse(w, bookmarkCountsResponse{
			Counts: results.counts,
		})
	} else {
		serverError(w, err)
	}
}

func (h *handlers) getHTMLCounts(w http.ResponseWriter, r *http.Request) {
	scheduleId := chi.URLParam(r, "scheduleId")

	results, err := h.getCountsEntry(r.Context(), scheduleId)

	if err == nil {
		now := time.Now()
		age := int(now.Sub(results.time).Seconds())
		builder := strings.Builder{}

		builder.WriteString("<!DOCTYPE html><html><head><title>Bookmark Counts</title></head><body>")
		builder.WriteString(
			"<table><thead><tr><th scope=\"col\">Item ID</th><th scope=\"col\">Count</th></tr></thead><tbody>",
		)

		type row struct {
			id    string
			count int
		}

		rows := slices.SortedStableFunc(func(yield func(r row) bool) {
			for id, ct := range results.counts {
				if (!yield(row{id, ct})) {
					return
				}
			}
		}, func(a row, b row) int {
			return strings.Compare(a.id, b.id)
		})

		slices.SortStableFunc(rows, func(a row, b row) int {
			return b.count - a.count
		})

		for _, r := range rows {
			builder.WriteString(
				fmt.Sprintf("<tr><td>%s</td><td>%d</td></tr>", r.id, r.count),
			)
		}

		builder.WriteString("</tbody></table></body></html>")

		w.Header().Set("Cache-Control", fmt.Sprintf("public, max-age=%d", CountsCacheSeconds))
		w.Header().Set("Age", strconv.Itoa(age))
		w.Header().Set("Content-Type", "text/html")

		w.Write([]byte(builder.String()))
	} else {
		serverError(w, err)
	}
}

func (h *handlers) validateIds(ctx context.Context, scheduleId string, ids []string) ([]string, error) {
	idsMap := make(map[string]struct{}, len(ids))
	for _, id := range ids {
		idsMap[id] = struct{}{}
	}

	validIds, err := h.scheduleService.GetScheduleItemIds(ctx, scheduleId)
	if err != nil {
		return nil, err
	}

	var results []string

	for id := range idsMap {
		_, ok := validIds[id]
		if ok {
			results = append(results, id)
		}
	}

	return results, nil
}

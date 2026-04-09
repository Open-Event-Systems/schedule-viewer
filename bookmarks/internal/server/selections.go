package server

import (
	"bookmarks/internal/models"
	"bookmarks/internal/selections"
	"errors"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
)

const SelectionsCacheSeconds = 86400

type selectionsResponse struct {
	Selections selections.Selections `json:"selections"`
}

func (h *handlers) getSelections(w http.ResponseWriter, r *http.Request) {
	scheduleId := chi.URLParam(r, "scheduleId")
	selectionsId := chi.URLParam(r, "selectionsId")

	var sels selections.Selections
	var err error

	err = h.withTx(r.Context(), func(db *models.DB) error {
		if selectionsId == h.emptySelections.Id() {
			sels = h.emptySelections
			return nil
		}

		var exists bool
		if exists, err = db.SelectionsExists(scheduleId, selectionsId); err != nil {
			serverError(w, err)
			return err
		}

		if !exists {
			httpError(w, http.StatusNotFound)
			return errors.New("not found")
		}

		if sels, err = db.GetSelections(scheduleId, selectionsId); err != nil {
			serverError(w, err)
			return err
		}

		return nil
	})

	if err == nil {
		w.Header().Set("Cache-Control", fmt.Sprintf("public, max-age=%d", SelectionsCacheSeconds))
		jsonResponse(w, selectionsResponse{Selections: sels})
	}
}

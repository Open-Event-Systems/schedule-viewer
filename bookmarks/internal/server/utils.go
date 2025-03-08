package server

import (
	"encoding/json"
	"net/http"
)


func httpError(w http.ResponseWriter, status int) {
	http.Error(w, http.StatusText(status), status)
}

func jsonResponse(w http.ResponseWriter, value any) {
	bytes, err := json.Marshal(value)
	if err != nil {
		panic(err)
	}

	w.Header().Add("Content-Type", "application/json")
	w.Write(bytes)
}
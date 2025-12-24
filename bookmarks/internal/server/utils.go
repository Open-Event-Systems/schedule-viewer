package server

import (
	"bookmarks/internal/db"
	"context"
	"database/sql"
	"log"
	"net/http"
	"net/netip"
	"strings"

	json "github.com/goccy/go-json"
)

func httpError(w http.ResponseWriter, code int) {
	http.Error(w, http.StatusText(code), code)
}

func serverError(w http.ResponseWriter, err error) {
	if err != nil {
		log.Printf("unhandled error: %s", err)
	}
	httpError(w, http.StatusInternalServerError)
}

func readJSONBody(req *http.Request, dest any) error {
	defer req.Body.Close()
	dec := json.NewDecoder(req.Body)
	return dec.Decode(dest)
}

func jsonResponse(w http.ResponseWriter, obj any) error {
	w.Header().Set("Content-Type", "application/json")
	enc := json.NewEncoder(w)
	return enc.Encode(obj)
}

func getScheme(r *http.Request) string {
	// TODO: configurable trust of this header
	proto := r.Header.Get("X-Forwarded-Proto")
	if proto == "" {
		if r.TLS != nil {
			proto = "https"
		} else {
			proto = "http"
		}
	}
	return proto
}

func getSelectionsURL(base string, req *http.Request, scheduleId string, selectionsId string) string {
	selsURL := *req.URL
	selsURL.Host = req.Host
	selsURL.Scheme = getScheme(req)
	selsURL.Path = "/"
	return selsURL.JoinPath(base, "schedules", scheduleId, "selections", selectionsId).String()
}

func withTx(db *sql.DB, ctx context.Context, f func(tx *sql.Tx) (bool, error)) (bool, error) {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return false, err
	}
	var commit = false
	defer func() {
		if !commit {
			tx.Rollback()
		}
	}()

	commit, err = f(tx)
	if commit && err == nil {
		err = tx.Commit()
	}

	return commit, err
}

func withDB(sqlDb *sql.DB, ctx context.Context, scheduleId string, f func(db *db.DB) (bool, error)) (bool, error) {
	return withTx(sqlDb, ctx, func(tx *sql.Tx) (bool, error) {
		dbObj := db.NewDB(ctx, scheduleId, tx)
		return f(dbObj)
	})
}

func getSessionIPs(addr netip.Addr) (string, string) {
	prefixSize := 32

	if addr.Is6() {
		prefixSize = 64
	}

	asStr := addr.String()
	prefixed, _ := addr.Prefix(prefixSize)
	masked := prefixed.Masked()
	return asStr, masked.String()
}

func getIP(proxyCount int, req *http.Request) netip.Addr {
	if proxyCount == 0 {
		addr := netip.MustParseAddrPort(req.RemoteAddr)
		return addr.Addr()
	}

	var ips []string

	for _, val := range req.Header.Values("X-Forwarded-For") {
		parts := strings.Split(val, ",")
		for _, ipStr := range parts {
			ips = append(ips, strings.TrimSpace(ipStr))
		}
	}

	trustedIdx := len(ips) - proxyCount
	if trustedIdx < 0 {
		trustedIdx = 0
	}

	if trustedIdx >= len(ips) {
		addr := netip.MustParseAddrPort(req.RemoteAddr)
		return addr.Addr()
	}

	return netip.MustParseAddr(ips[trustedIdx])
}

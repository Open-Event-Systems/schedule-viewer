package server

import (
	"bookmarks/internal/models"
	"context"
	"log"
	"net/http"
	"net/netip"
	"net/url"
	"strings"

	"github.com/goccy/go-json"
)

type errorResponseBody struct {
	Code    int    `json:"code"`
	Message string `json:"message,omitempty"`
}

type errorResponse struct {
	Error errorResponseBody `json:"error"`
}

func serverError(w http.ResponseWriter, err error) {
	log.Printf("unhandled error: %s", err)
	httpError(w, http.StatusInternalServerError)
}

func httpError(w http.ResponseWriter, status int) {
	httpErrorMessage(w, status, http.StatusText(status))
}

func httpErrorMessage(w http.ResponseWriter, status int, message string) {
	jsonResponseStatus(w, status, errorResponse{
		Error: errorResponseBody{
			Code:    status,
			Message: message,
		},
	})
}

func jsonResponseStatus(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	enc := json.NewEncoder(w)
	enc.Encode(body)
}

func jsonResponse(w http.ResponseWriter, body any) {
	jsonResponseStatus(w, http.StatusOK, body)
}

func jsonBody(w http.ResponseWriter, r *http.Request, dst any) error {
	dec := json.NewDecoder(r.Body)
	if err := dec.Decode(dst); err != nil {
		httpError(w, http.StatusBadRequest)
		return err
	}
	return nil
}

func (h *handlers) withTx(ctx context.Context, f func(db *models.DB) error) error {
	db := models.NewDB(ctx, h.conn)
	return db.WithTx(f)
}

func getSessionIPs(addr netip.Addr) (ip string, partialIP string) {
	prefixSize := 32

	if addr.Is6() {
		prefixSize = 64
	}

	ip = addr.String()
	prefixed, _ := addr.Prefix(prefixSize)
	partialIP = prefixed.Masked().String()
	return
}

func getIP(proxyCount int, req *http.Request) netip.Addr {
	if proxyCount == 0 {
		addr := netip.MustParseAddrPort(req.RemoteAddr)
		return addr.Addr()
	}

	var ips []string

	for _, val := range req.Header.Values("X-Forwarded-For") {
		for ipStr := range strings.SplitSeq(val, ",") {
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

func getFullURL(r *http.Request) url.URL {
	urlObj := *r.URL
	urlObj.Scheme = getProto(r)
	urlObj.Host = r.Host
	return urlObj
}

func getProto(r *http.Request) string {
	xfp := r.Header.Get("X-Forwarded-Proto")
	if xfp == "https" {
		return "https"
	}
	return "http"
}

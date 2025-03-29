package server

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	nanoid "github.com/matoous/go-nanoid/v2"
)

const COOKIE_NAME = "schedule-session-"
const COOKIE_EXPIRATION = 3 * 30 * 24 * time.Hour / time.Second

var ErrInvalidSession = errors.New("invalid session")

type sessionId struct {
	Id        string
	Signature string
}

func newSessionId(secret string) sessionId {
	id := nanoid.Must()
	sig := sign(COOKIE_NAME+"="+id, secret)
	return sessionId{
		Id:        id,
		Signature: sig,
	}
}

func getSessionIdFromCookie(req *http.Request, secret string, scheduleId string) (sessionId, error) {
	cookieVal, err := req.Cookie(getCookieName(scheduleId))
	if err != nil {
		return sessionId{}, ErrInvalidSession
	}

	return verifySessionId(cookieVal.Value, secret)
}

func verifySessionId(sessionValue string, secret string) (sessionId, error) {
	parts := strings.Split(sessionValue, ".")
	if len(parts) < 2 {
		return sessionId{}, ErrInvalidSession
	}

	id := parts[0]
	sig := parts[1]
	checkSig := sign(COOKIE_NAME+"="+id, secret)
	if sig != checkSig {
		return sessionId{}, ErrInvalidSession
	}

	return sessionId{
		Id:        id,
		Signature: sig,
	}, nil
}

func (s sessionId) String() string {
	return s.Id + "." + s.Signature
}

func (s sessionId) SetCookie(w http.ResponseWriter, domain string, scheduleId string) {
	http.SetCookie(w, &http.Cookie{
		Name:     getCookieName(scheduleId),
		Value:    s.String(),
		MaxAge:   int(COOKIE_EXPIRATION),
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
		Domain:   domain,
	})
}

func sign(text string, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(text))
	sig := mac.Sum(nil)
	sigStr := base64.URLEncoding.EncodeToString(sig)
	return strings.TrimRight(sigStr, "=")
}

func getCookieName(scheduleId string) string {
	return fmt.Sprintf("%s%s", COOKIE_NAME, scheduleId)
}

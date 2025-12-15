package server

import (
	"errors"
	"fmt"

	"github.com/golang-jwt/jwt/v5"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

type SessionToken struct {
	jwt.RegisteredClaims
	Type       string `json:"typ"`
	ScheduleId string `json:"sch"`
}

const tokenType = "bkmsess"
const idPrefix = "bkmsess_"

var ErrInvalidSessionId = errors.New("invalid session id")

func NewSession(scheduleId string) SessionToken {
	id := idPrefix + gonanoid.Must()
	return SessionToken{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject: id,
		},
		Type:       tokenType,
		ScheduleId: scheduleId,
	}
}

func (s SessionToken) Validate() error {
	if s.Type != tokenType {
		return ErrInvalidSessionId
	}
	return nil
}

func DecodeSession(tokStr string, secret string) (SessionToken, error) {
	var sess SessionToken

	_, err := jwt.ParseWithClaims(
		tokStr,
		&sess,
		func(t *jwt.Token) (any, error) { return []byte(secret), nil },
		jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Name}),
	)

	if err != nil {
		return sess, fmt.Errorf("%w: %w", ErrInvalidSessionId, err)
	}

	return sess, nil
}

func (s SessionToken) Encode(secret string) string {
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, s)
	str, err := tok.SignedString([]byte(secret))
	if err != nil {
		panic(err)
	}

	return str
}

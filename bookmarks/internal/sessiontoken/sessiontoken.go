package sessiontoken

import (
	"errors"
	"fmt"

	"github.com/golang-jwt/jwt/v5"
)

type SessionTokenService struct {
	secret string
}

type sessionToken struct {
	jwt.RegisteredClaims
	Type       string `json:"typ"`
	ScheduleId string `json:"sch"`
}

var ErrInvalidSessionId = errors.New("invalid session id")

const SessionTokenType = "bkmsess"

func NewSessionTokenService(secret string) *SessionTokenService {
	return &SessionTokenService{secret: secret}
}

func (s *SessionTokenService) CreateToken(scheduleId string, sessionId string) string {
	token := sessionToken{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject: sessionId,
		},
		Type:       SessionTokenType,
		ScheduleId: scheduleId,
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, token)

	asStr, err := t.SignedString([]byte(s.secret))
	if err != nil {
		panic(err)
	}

	return asStr
}

func (s SessionTokenService) ValidateToken(tokenStr string) (scheduleId string, sessionId string, err error) {
	var tok sessionToken

	_, err = jwt.ParseWithClaims(tokenStr, &tok, func(t *jwt.Token) (any, error) {
		return []byte(s.secret), nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Name}))
	if err != nil {
		return scheduleId, sessionId, fmt.Errorf("%w: %w", ErrInvalidSessionId, err)
	}

	if tok.Type != SessionTokenType {
		return scheduleId, sessionId, fmt.Errorf("%w: invalid type", ErrInvalidSessionId)
	}

	return tok.ScheduleId, tok.Subject, nil
}

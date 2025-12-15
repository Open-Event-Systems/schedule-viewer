package server_test

import (
	"bookmarks/internal/server"
	"errors"
	"testing"
)

func TestSessionId(t *testing.T) {
	s := server.NewSession("example")
	asStr := s.Encode("changeit")

	dec, err := server.DecodeSession(asStr, "changeit")
	if err != nil {
		t.Fatal(err)
	}

	if dec.ScheduleId != "example" {
		t.Fatalf("wrong schedule id: %v", dec.ScheduleId)
	}
}

func TestSessionIdValidation(t *testing.T) {
	s := server.NewSession("example")
	asStr := s.Encode("changeit")

	_, err := server.DecodeSession(asStr, "changeit2")
	if !errors.Is(err, server.ErrInvalidSessionId) {
		t.Fatalf("expected invalid session error, got %s", err)
	}
}

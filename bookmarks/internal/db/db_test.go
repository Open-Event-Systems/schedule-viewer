package db_test

import (
	"bookmarks/internal/db"
	"bookmarks/internal/selection"
	"os"
	"slices"
	"testing"
)

const SCHEDULE_ID = "test-schedule"
const SESSION_ID = "test-session"

func TestDB(t *testing.T) {
	fn, err := os.CreateTemp(".", "*.sqlite")
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	defer fn.Close()
	defer os.Remove(fn.Name())

	db := db.NewDB(fn.Name())
	db.Init()

	selection := selection.NewSelection([]string{"e1", "e2", "e3"})

	hash, err := db.SaveSelection(SCHEDULE_ID, selection)
	if err != nil {
		t.Fatal(err)
	}

	retrieved, err := db.GetSelection(SCHEDULE_ID, hash)
	if err != nil {
		t.Fatal(err)
	}

	if !slices.Equal(retrieved.GetEventIds(), selection.GetEventIds()) {
		t.Fatalf("expected %v, got %v", selection.GetEventIds(), retrieved.GetEventIds())
	}

	_, err = db.SaveSelection(SCHEDULE_ID, selection)
	if err != nil {
		t.Fatal(err)
	}

	date, err := db.SetSessionSelection(SESSION_ID, SCHEDULE_ID, hash)
	if err != nil {
		t.Fatal(err)
	}

	retrieved, retrievedDate, err := db.GetSessionSelection(SESSION_ID, SCHEDULE_ID)
	if err != nil {
		t.Fatal(err)
	}

	if !slices.Equal(retrieved.GetEventIds(), selection.GetEventIds()) {
		t.Fatalf("expected %v, got %v", selection.GetEventIds(), retrieved.GetEventIds())
	}

	if retrievedDate != date {
		t.Fatalf("expected %v, got %v", date, retrievedDate)
	}
}

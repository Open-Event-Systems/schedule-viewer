package structs_test

import (
	"encoding/json"
	"oembed/internal/structs"
	"testing"
)

func TestUnmarshalEventsURL(t *testing.T) {
	body := "{\"events\": \"https://example.net/events.json\"}"
	var res structs.ScheduleConfig
	err := json.Unmarshal([]byte(body), &res)
	if err != nil {
		t.Fatal(err)
	}

	if res.Events.URL != "https://example.net/events.json" {
		t.Fatalf("expected URL, got %s", res.Events.URL)
	}
}

func TestUnmarshalEventsLiteral(t *testing.T) {
	body := "{\"events\": [{\"id\": \"test\"}]}"
	var res structs.ScheduleConfig
	err := json.Unmarshal([]byte(body), &res)
	if err != nil {
		t.Fatal(err)
	}

	if res.Events.URL != "" {
		t.Fatalf("expected no URL, got %s", res.Events.URL)
	}

	if len(res.Events.Events) != 1 || res.Events.Events[0].Id != "test" {
		t.Fatalf("expected event array, got %v", res.Events.Events)
	}
}

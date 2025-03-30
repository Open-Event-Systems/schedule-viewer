package schedule_test

import (
	"oembed/internal/schedule"
	"testing"
)

func TestGetConfigURL(t *testing.T) {
	cases := [][]string{
		{"https://example.net/events/test", "https://example.net/config.json"},
		{"https://example.net/events/test/", "https://example.net/config.json"},
		{"https://example.net/schedule/events/test", "https://example.net/schedule/config.json"},
	}

	for _, testCase := range cases {
		t.Run(testCase[0], func (t *testing.T) {
			res := schedule.GetConfigURL(testCase[0])
			if res != testCase[1] {
				t.Fatalf("expected %s, got %s", testCase[1], res)
			}
		})
	}
}

func TestGetBaseURL(t *testing.T) {
	cases := [][]string{
		{"https://example.net/events/test", "https://example.net/"},
		{"https://example.net/events/test/", "https://example.net/"},
		{"https://example.net/schedule/events/test", "https://example.net/schedule/"},
		{"https://example.net/schedule/events/test/", "https://example.net/schedule/"},
		{"https://example.net/schedule/bad/other", ""},
		{"https://example.net/events/test?q=t", "https://example.net/"},
		{"https://example.net/events/test#test", "https://example.net/"},
	}

	for _, testCase := range cases {
		t.Run(testCase[0], func (t *testing.T) {
			res := schedule.GetBaseURL(testCase[0])
			if res != testCase[1] {
				t.Fatalf("expected %s, got %s", testCase[1], res)
			}
		})
	}
}

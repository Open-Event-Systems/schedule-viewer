package validator

import (
	"bookmarks/internal/structs"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/phuslu/lru"
)

const CACHE_DURATION = 30 * time.Second

var ErrNoSchedule = errors.New("no such schedule")

type Validator struct {
	entries map[string]string
	cache   *lru.TTLCache[string, map[string]struct{}]
}

type scheduleEntry struct {
	url        string
	events     map[string]struct{}
	lastUpdate time.Time
	lock       sync.Mutex
}

func NewValidator(urls map[string]string) *Validator {
	return &Validator{
		entries: urls,
		cache:   lru.NewTTLCache(len(urls), lru.WithLoader[string, map[string]struct{}](loadEntries)),
	}
}

func (v *Validator) ValidateEvents(scheduleId string, input []string) ([]string, error) {
	url, ok := v.entries[scheduleId]

	if !ok {
		return nil, ErrNoSchedule
	}

	entries, err, ok := v.cache.GetOrLoad(context.Background(), url, nil)
	if err != nil {
		return nil, err
	}

	res := make([]string, 0)
	for _, eventId := range input {
		if _, ok := entries[eventId]; ok {
			res = append(res, eventId)
		}
	}

	return res, nil
}

func loadEntries(ctx context.Context, url string) (map[string]struct{}, time.Duration, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, 0, err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, 0, err
	}

	if resp.StatusCode != 200 {
		return nil, 0, fmt.Errorf("unexpected http status %d when fetching %s", resp.StatusCode, url)
	}

	var events structs.EventsResponse
	if err = json.NewDecoder(resp.Body).Decode(&events); err != nil {
		return nil, 0, err
	}

	entries := make(map[string]struct{})
	for _, event := range events.Events {
		entries[event.Id] = struct{}{}
	}

	return entries, CACHE_DURATION, nil
}

package schedule

import (
	"bookmarks/internal/config"
	"context"
	"fmt"
	"net/http"
	"slices"
	"sync"
	"time"

	"github.com/goccy/go-json"
	"github.com/maypok86/otter/v2"
)

type scheduleItem struct {
	Id string `json:"id"`
}

type itemOrURL struct {
	URL  string
	Item scheduleItem
}

type scheduleConfig struct {
	Items []itemOrURL `json:"items"`
}

const ScheduleCacheSeconds = 120

func (u *itemOrURL) UnmarshalJSON(data []byte) error {
	var asItem scheduleItem
	err := json.Unmarshal(data, &asItem)
	if err == nil {
		u.Item = asItem
		return nil
	}

	var asStr string
	err = json.Unmarshal(data, &asStr)

	if err == nil {
		u.URL = asStr
		return nil
	}
	return err
}

type ScheduleService struct {
	client http.Client
	urls   map[string]string
	cache  *otter.Cache[string, map[string]struct{}]
}

func NewScheduleService(cfgs map[string]config.ScheduleConfig) *ScheduleService {
	cache := otter.Must(&otter.Options[string, map[string]struct{}]{
		MaximumSize:      len(cfgs),
		InitialCapacity:  len(cfgs),
		ExpiryCalculator: otter.ExpiryWriting[string, map[string]struct{}](ScheduleCacheSeconds * time.Second),
	})

	urls := map[string]string{}

	for schId, cfg := range cfgs {
		urls[schId] = cfg.URL
	}

	s := &ScheduleService{
		cache: cache,
		urls:  urls,
	}

	return s
}

func (s *ScheduleService) GetScheduleItemIds(ctx context.Context, id string) (map[string]struct{}, error) {
	return s.cache.Get(ctx, id, otter.LoaderFunc[string, map[string]struct{}](func(ctx context.Context, key string) (map[string]struct{}, error) {
		ids, err := s.fetchConfig(ctx, s.urls[id])
		if err != nil {
			return nil, err
		}

		idMap := make(map[string]struct{}, len(ids))
		for _, id := range ids {
			idMap[id] = struct{}{}
		}

		return idMap, nil
	}))
}

func (s *ScheduleService) fetchConfig(ctx context.Context, url string) ([]string, error) {
	var res []string
	var urls []string

	items, err := s.fetchItems(ctx, url)
	if err != nil {
		return nil, err
	}

	for _, item := range items {
		if item.Item.Id != "" {
			res = append(res, item.Item.Id)
		} else {
			urls = append(urls, item.URL)
		}
	}

	type idsOrErr struct {
		ids []string
		err error
	}

	urlResults := make(chan *idsOrErr, len(urls))

	wg := sync.WaitGroup{}
	for _, url := range urls {
		wg.Add(1)
		go func() {
			defer wg.Done()
			ids, err := s.fetchIds(ctx, url)
			urlResults <- &idsOrErr{ids: ids, err: err}
		}()
	}

	wg.Wait()
	close(urlResults)

	for {
		val := <-urlResults
		if val == nil {
			break
		}

		if val.err != nil {
			return nil, val.err
		}

		res = append(res, val.ids...)
	}

	return res, nil
}

func (s *ScheduleService) fetchIds(ctx context.Context, url string) ([]string, error) {
	items, err := s.fetchItems(ctx, url)
	if err != nil {
		return nil, err
	}

	ids := slices.Collect(func(yield func(id string) bool) {
		for _, item := range items {
			if item.Item.Id != "" {
				if !yield(item.Item.Id) {
					return
				}
			}
		}
	})

	return ids, nil
}

func (s *ScheduleService) fetchItems(ctx context.Context, url string) ([]itemOrURL, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	dec := json.NewDecoder(resp.Body)
	var res scheduleConfig

	err = dec.Decode(&res)
	if err != nil {
		return nil, err
	}

	return res.Items, nil
}

package schedule

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"slices"

	"github.com/goccy/go-json"
)

type ScheduleService struct {
	client http.Client
}

type scheduleConfig struct {
	Items []itemOrURL `json:"items"`
}

type itemOrURL struct {
	Item scheduleItem
	URL  string
}

type itemsBody struct {
	Items []scheduleItem `json:"items"`
}

type scheduleItem struct {
	Id string `json:"id"`
}

var ErrScheduleFetchFailed = errors.New("fetching schedule failed")

func NewScheduleService() *ScheduleService {
	return &ScheduleService{}
}

func (s *ScheduleService) GetValidIds(ctx context.Context, configURL string) (map[string]struct{}, error) {
	results := make(map[string]struct{}, 0)

	res, err := s.getConfig(ctx, configURL)
	if err != nil {
		return nil, err
	}

	for _, item := range res {
		if item.Id != "" {
			results[item.Id] = struct{}{}
		}
	}

	return results, nil
}

func (s *ScheduleService) getConfig(ctx context.Context, configURL string) ([]scheduleItem, error) {
	parsedURL, err := url.Parse(configURL)
	if err != nil {
		return nil, err
	}

	req, _ := http.NewRequestWithContext(ctx, "GET", configURL, nil)
	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ErrScheduleFetchFailed, err)
	}
	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("%w: unexpected status code %d", ErrScheduleFetchFailed, resp.StatusCode)
	}
	defer resp.Body.Close()

	var config scheduleConfig
	dec := json.NewDecoder(resp.Body)
	err = dec.Decode(&config)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ErrScheduleFetchFailed, err)
	}

	items := slices.Collect(func(yield func(item scheduleItem) bool) {
		for _, entry := range config.Items {
			if entry.URL != "" {
				// TODO
				subItems, err := s.getItems(ctx, parsedURL, entry.URL)
				if err != nil {
					if !errors.Is(err, context.Canceled) {
						log.Printf("error fetching %s: %s", entry.URL, err)
					}
					continue
				}

				for _, subItem := range subItems {
					if !yield(subItem) {
						return
					}
				}

			} else {
				if !yield(entry.Item) {
					return
				}
			}
		}
	})

	return items, nil
}

func (s *ScheduleService) getItems(ctx context.Context, baseURL *url.URL, configURL string) ([]scheduleItem, error) {
	parsedURL, err := url.Parse(configURL)
	if err != nil {
		return nil, err
	}

	if parsedURL.Scheme == "" {
		parsedURL.Scheme = baseURL.Scheme
		parsedURL.Host = baseURL.Host
	}

	req, _ := http.NewRequestWithContext(ctx, "GET", parsedURL.String(), nil)
	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ErrScheduleFetchFailed, err)
	}
	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("%w: unexpected status code %d", ErrScheduleFetchFailed, resp.StatusCode)
	}
	defer resp.Body.Close()

	dec := json.NewDecoder(resp.Body)
	var body itemsBody
	err = dec.Decode(&body)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ErrScheduleFetchFailed, err)
	}

	return body.Items, nil
}

func (it *itemOrURL) UnmarshalJSON(b []byte) error {
	var asString string
	var asItem scheduleItem

	err := json.Unmarshal(b, &asString)
	if err == nil {
		it.URL = asString
		return nil
	}

	err = json.Unmarshal(b, &asItem)
	if err == nil {
		it.Item = asItem
		return nil
	}

	return err
}

package client

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/goccy/go-json"
	"github.com/maypok86/otter/v2"
	"github.com/open-event-systems/schedule-viewer/lib/go/schedule"
)

var ErrClientFetchFailed = errors.New("schedule data fetch failed")

type itemsResponse struct {
	Items []schedule.Item
}

type Client struct {
	httpClient  http.Client
	configCache *otter.Cache[string, cacheEntry[schedule.Config]]
	itemsCache  *otter.Cache[string, cacheEntry[[]schedule.Item]]
}

func NewClient() *Client {
	client := &Client{
		configCache: otter.Must(&otter.Options[string, cacheEntry[schedule.Config]]{
			InitialCapacity: 1,
			ExpiryCalculator: otter.ExpiryWritingFunc(func(entry otter.Entry[string, cacheEntry[schedule.Config]]) time.Duration {
				now := time.Now()
				return max(entry.Value.Expires.Sub(now), cacheMinTime)
			}),
		}),
		itemsCache: otter.Must(&otter.Options[string, cacheEntry[[]schedule.Item]]{
			InitialCapacity: 1,
			ExpiryCalculator: otter.ExpiryWritingFunc(func(entry otter.Entry[string, cacheEntry[[]schedule.Item]]) time.Duration {
				now := time.Now()
				return max(entry.Value.Expires.Sub(now), cacheMinTime)
			}),
		}),
	}
	return client
}

func (c *Client) GetConfig(ctx context.Context, url string) (schedule.Config, error) {
	entry, err := c.configCache.Get(ctx, url, otter.LoaderFunc[string, cacheEntry[schedule.Config]](c.configLoader))
	return entry.Data, err
}

func (c *Client) configLoader(ctx context.Context, url string) (cacheEntry[schedule.Config], error) {
	var entry cacheEntry[schedule.Config]
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return entry, err
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return entry, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return entry, fmt.Errorf("%w: fetching %s: unexpected http status %d", ErrClientFetchFailed, url, resp.StatusCode)
	}

	dec := json.NewDecoder(resp.Body)
	if err = dec.Decode(&entry.Data); err != nil {
		return entry, fmt.Errorf("%w: fetching %s: parsing failed: %w", ErrClientFetchFailed, url, err)
	}
	entry.Date = getResponseDate(resp)
	entry.Expires = getResponseExpiration(resp)
	return entry, err
}

func (c *Client) GetItems(ctx context.Context, itemsOrURLs []schedule.ItemOrURL) ([]schedule.Item, error) {
	items := make([]schedule.Item, 0, len(itemsOrURLs))
	var errs []error

	resChan, errChan := c.getFromItemsOrURLs(ctx, itemsOrURLs)

	for resChan != nil || errChan != nil {
		select {
		case item := <-resChan:
			if item != nil {
				items = append(items, *item)
			} else {
				resChan = nil
			}
		case err := <-errChan:
			if err != nil {
				errs = append(errs, err)
			} else {
				errChan = nil
			}
		}
	}

	return items, errors.Join(errs...)
}

func (c *Client) getItems(ctx context.Context, url string) ([]schedule.Item, error) {
	entry, err := c.itemsCache.Get(ctx, url, otter.LoaderFunc[string, cacheEntry[[]schedule.Item]](c.itemsLoader))
	return entry.Data, err
}

func (c *Client) itemsLoader(ctx context.Context, url string) (cacheEntry[[]schedule.Item], error) {
	var entry cacheEntry[[]schedule.Item]

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return entry, err
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return entry, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return entry, fmt.Errorf("%w: fetching %s: unexpected http status %d", ErrClientFetchFailed, url, resp.StatusCode)
	}

	var respBody itemsResponse
	dec := json.NewDecoder(resp.Body)
	if err = dec.Decode(&respBody); err != nil {
		return entry, fmt.Errorf("%w: fetching %s: parsing failed: %w", ErrClientFetchFailed, url, err)
	}

	entry.Data = respBody.Items
	entry.Date = getResponseDate(resp)
	entry.Expires = getResponseExpiration(resp)
	return entry, err
}

func (c *Client) getFromItemsOrURLs(ctx context.Context, itemsOrURLs []schedule.ItemOrURL) (<-chan *schedule.Item, <-chan error) {
	resChan := make(chan *schedule.Item)
	errChan := make(chan error)

	go func() {
		defer close(resChan)
		defer close(errChan)
		wg := sync.WaitGroup{}

		for _, itemOrURL := range itemsOrURLs {
			if itemOrURL.URL != "" {
				wg.Go(func() {
					items, err := c.getItems(ctx, itemOrURL.URL)
					if err != nil {
						errChan <- err
						return
					}

					for idx := range items {
						resChan <- &items[idx]
					}
				})
			} else if itemOrURL.Item != nil {
				resChan <- itemOrURL.Item
			}
		}

		wg.Wait()
	}()

	return resChan, errChan
}

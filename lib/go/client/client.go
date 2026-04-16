package client

import (
	"context"
	"iter"
	"net/http"
	"slices"
	"time"
	"ule/schedule"

	"github.com/goccy/go-json"
	"github.com/maypok86/otter/v2"
)

type itemsResponse struct {
	Items []schedule.Item
}

type Client struct {
	httpClient http.Client
	cache      *otter.Cache[string, cacheEntry]
}

func NewClient() *Client {

	client := &Client{
		cache: otter.Must(&otter.Options[string, cacheEntry]{
			MaximumSize:     100,
			InitialCapacity: 2,
			RefreshCalculator: otter.RefreshWritingFunc(func(entry otter.Entry[string, cacheEntry]) time.Duration {
				now := time.Now()
				return entry.Value.Expires.Sub(now)
			}),
		}),
	}
	return client
}

func (c *Client) GetConfig(ctx context.Context, url string) (schedule.Config, error) {
	loader := otter.LoaderFunc[string, cacheEntry](func(ctx context.Context, url string) (cacheEntry, error) {
		var entry cacheEntry
		curEntry, ok := c.cache.GetEntryQuietly(url)
		var lastModified *time.Time

		if ok {
			lastModified = &curEntry.Value.Date
		}

		resp, err := c.conditionalGet(ctx, url, lastModified)
		if err != nil {
			return entry, err
		}
		defer resp.Body.Close()

		if resp.StatusCode == 304 {
			entry.Value = curEntry.Value.Value
			entry.Date = curEntry.Value.Date
			entry.Expires = getResponseExpiration(resp)
			return entry, nil
		}

		var config schedule.Config
		dec := json.NewDecoder(resp.Body)
		err = dec.Decode(&config)
		entry.Value = config
		entry.Date = getResponseDate(resp)
		entry.Expires = getResponseExpiration(resp)
		return entry, err
	})

	var config schedule.Config
	value, err := c.cache.Get(ctx, url, loader)
	if err != nil {
		return config, err
	}

	config = value.Value.(schedule.Config)

	return config, nil
}

func (c *Client) GetItems(ctx context.Context, itemsOrURLs []schedule.ItemOrURL) ([]schedule.Item, error) {
	var err error
	items := slices.Collect(c.getFromItemsOrURLs(ctx, itemsOrURLs, &err))
	return items, err
}

func (c *Client) getItems(ctx context.Context, url string) ([]schedule.Item, error) {

	loader := otter.LoaderFunc[string, cacheEntry](func(ctx context.Context, url string) (cacheEntry, error) {
		var entry cacheEntry
		curEntry, ok := c.cache.GetEntryQuietly(url)
		var lastModified *time.Time

		if ok {
			lastModified = &curEntry.Value.Date
		}

		resp, err := c.conditionalGet(ctx, url, lastModified)
		if err != nil {
			return entry, err
		}
		defer resp.Body.Close()

		if resp.StatusCode == 304 {
			entry.Value = curEntry.Value.Value
			entry.Date = curEntry.Value.Date
			entry.Expires = getResponseExpiration(resp)
			return entry, nil
		}

		var respBody itemsResponse
		dec := json.NewDecoder(resp.Body)
		err = dec.Decode(&respBody)
		if err != nil {
			return entry, err
		}

		entry.Value = respBody.Items
		entry.Date = getResponseDate(resp)
		entry.Expires = getResponseExpiration(resp)
		return entry, err
	})

	var items []schedule.Item
	value, err := c.cache.Get(ctx, url, loader)
	if err != nil {
		return items, err
	}

	items = value.Value.([]schedule.Item)

	return items, nil
}

func (c *Client) getFromItemsOrURLs(ctx context.Context, itemsOrURLs []schedule.ItemOrURL, outErr *error) iter.Seq[schedule.Item] {
	return func(yield func(schedule.Item) bool) {
	iterLoop:
		for _, itemOrURL := range itemsOrURLs {
			if itemOrURL.URL != "" {
				items, err := c.getItems(ctx, itemOrURL.URL)
				if err != nil {
					*outErr = err
					return
				}

				for _, item := range items {
					if !yield(item) {
						break iterLoop
					}
				}
			} else if itemOrURL.Item != nil {
				if !yield(*itemOrURL.Item) {
					break iterLoop
				}
			}
		}

		*outErr = nil
	}
}

package client

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type cacheEntry struct {
	Date    time.Time
	Expires time.Time
	Value   any
}

var cacheMinTime = 1 * time.Minute

func (c *Client) conditionalGet(ctx context.Context, url string, lastDate *time.Time) (*http.Response, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	if lastDate != nil {
		gmtLastDate := lastDate.UTC()
		req.Header.Set("If-Modified-Since", gmtLastDate.Format(http.TimeFormat))
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != 200 && resp.StatusCode != 304 {
		resp.Body.Close()
		return nil, fmt.Errorf("unexpected http status %d", resp.StatusCode)
	}

	return resp, err
}

func getResponseDate(r *http.Response) time.Time {
	dateHeader := r.Header.Get("Date")
	dateVal, err := http.ParseTime(dateHeader)
	if err != nil {
		return time.Now()
	}
	return dateVal
}

func getResponseExpiration(r *http.Response) time.Time {
	date := getResponseDate(r)
	maxAge, hasMaxAge := getResponseMaxAge(r)
	if hasMaxAge {
		age := getResponseAge(r)
		return date.Add(maxAge).Add(-age)
	}
	exp, hasExp := getResponseExpires(r)
	if hasExp {
		return exp
	}

	return time.Now().Add(cacheMinTime)
}

func getResponseExpires(r *http.Response) (time.Time, bool) {
	dateHeader := r.Header.Get("Expires")
	dateVal, err := http.ParseTime(dateHeader)
	if err != nil {
		return time.Time{}, false
	}
	return dateVal, true
}

func getResponseMaxAge(r *http.Response) (time.Duration, bool) {
	ccHeader := r.Header.Get("Cache-Control")
	for part := range strings.SplitSeq(ccHeader, ",") {
		k, v, ok := strings.Cut(part, "=")
		if ok && k == "max-age" {
			val, err := strconv.Atoi(v)
			if err != nil {
				return time.Duration(val) * time.Second, true
			}
		}
	}

	return 0, false
}

func getResponseAge(r *http.Response) time.Duration {
	ageHeader := r.Header.Get("Age")
	if ageHeader == "" {
		return 0
	}
	val, err := strconv.Atoi(ageHeader)
	if err != nil {
		return 0
	}

	return time.Duration(val) * time.Second
}

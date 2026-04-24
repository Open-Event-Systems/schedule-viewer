package client

import (
	"net/http"
	"strconv"
	"strings"
	"time"
)

type cacheEntry[T any] struct {
	Date    time.Time
	Expires time.Time
	Data   T
}

var cacheMinTime = 1 * time.Minute
var cacheDefaultTime = 5 * time.Minute

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
	exp, hasExp := getResponseExpiresHeader(r)
	if hasExp {
		return exp
	}

	return time.Now().Add(cacheDefaultTime)
}

func getResponseExpiresHeader(r *http.Response) (time.Time, bool) {
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
		k, v, ok := strings.Cut(strings.TrimSpace(part), "=")
		if ok && k == "max-age" {
			val, err := strconv.Atoi(v)
			if err == nil {
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

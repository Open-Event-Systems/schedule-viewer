package schedule

import (
	"time"

	"github.com/goccy/go-json"
)

type LocalTime struct {
	time.Time
}

const LocalTimeFormat = "2006-01-02T15:04:05"

func (t LocalTime) MarshalJSON() ([]byte, error) {
	asStr := t.Format(LocalTimeFormat)
	return json.Marshal(asStr)
}

func (t *LocalTime) UnmarshalJSON(data []byte) error {
	var asStr string
	var err error

	if err = json.Unmarshal(data, &asStr); err != nil {
		return err
	}

	var parsed time.Time
	if parsed, err = time.Parse(LocalTimeFormat, asStr); err != nil {
		return err
	}

	t.Time = parsed
	return nil
}

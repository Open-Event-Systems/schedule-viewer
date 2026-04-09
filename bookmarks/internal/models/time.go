package models

import (
	"database/sql/driver"
	"fmt"
	"time"

	"github.com/goccy/go-json"
)

type ISOTime struct {
	time.Time
}

func (t *ISOTime) Scan(src any) error {
	asStr, ok := src.(string)
	if !ok {
		return fmt.Errorf("not a string: %v", src)
	}

	parsed, err := time.Parse(time.RFC3339Nano, asStr)
	if err != nil {
		return err
	}

	t.Time = parsed
	return nil
}

func (t ISOTime) Value() (driver.Value, error) {
	return t.Format(time.RFC3339Nano), nil
}

func (t ISOTime) MarshalJSON() ([]byte, error) {
	asStr := t.Format(time.RFC3339Nano)
	return json.Marshal(asStr)
}

func (t *ISOTime) UnmarshalJSON(data []byte) error {
	var asStr string
	if err := json.Unmarshal(data, &asStr); err != nil {
		return err
	}

	parsed, err := time.Parse(time.RFC3339Nano, asStr)
	if err != nil {
		return err
	}

	t.Time = parsed
	return nil
}

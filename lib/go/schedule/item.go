package schedule

import (
	"errors"
	"time"

	"github.com/goccy/go-json"
)

// A schedule item.
type Item struct {
	Id          string                `json:"id"`
	Type        string                `json:"type"`
	Title       string                `json:"title,omitempty"`
	Description string                `json:"description,omitempty"`
	Start       *time.Time            `json:"start,omitempty"`
	End         *time.Time            `json:"end,omitempty"`
	Location    SliceOrScalar[string] `json:"location,omitempty"`
	Icon        string                `json:"icon,omitempty"`
	Image       string                `json:"image,omitempty"`
	Contacts    []Contact             `json:"contacts,omitempty"`
}

// A contact.
// May be deserialized as either an object or a string representing the name
// field.
type Contact struct {
	Name string `json:"name,omitempty"`
	URL  string `json:"url,omitempty"`
}

func (c *Contact) UnmarshalJSON(data []byte) error {
	type plainStruct struct {
		Name string `json:"name,omitempty"`
		URL  string `json:"url,omitempty"`
	}

	var asStruct plainStruct
	var structErr error

	if structErr = json.Unmarshal(data, &asStruct); structErr == nil {
		*c = Contact(asStruct)
		return nil
	}

	var asString string
	var strErr error
	if strErr = json.Unmarshal(data, &asString); strErr == nil {
		c.Name = asString
		return nil
	}

	return errors.Join(structErr, strErr)
}

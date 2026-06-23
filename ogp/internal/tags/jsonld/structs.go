package jsonld

import (
	"github.com/goccy/go-json"
	"github.com/open-event-systems/schedule-viewer/lib/go/schedule"
)

type jsonLDObject struct {
	Context string `json:"@context,omitempty"`
	Type    string `json:"@type,omitempty"`
	Id      string `json:"@id,omitempty"`
}

type jsonLDEventList struct {
	jsonLDObject
	Items []string `json:"itemListElement"`
	Order string        `json:"itemListOrder,omitempty"`
}

type jsonLDEvent struct {
	jsonLDObject
	Status      string                      `json:"eventStatus,omitempty"`
	Title       string                      `json:"name,omitempty"`
	Description string                      `json:"description,omitempty"`
	Start       *schedule.LocalTime         `json:"startDate,omitempty"`
	End         *schedule.LocalTime         `json:"endDate,omitempty"`
	Location    optionalSlice[jsonLDPlace]  `json:"location,omitempty"`
	Performer   optionalSlice[jsonLDPerson] `json:"performer,omitempty"`
	Image       optionalSlice[string]       `json:"image,omitempty"`
	URL         string                      `json:"url,omitempty"`
}

type jsonLDPerson struct {
	jsonLDObject
	Name string `json:"name,omitempty"`
	URL  string `json:"url,omitempty"`
}

type jsonLDPlace struct {
	jsonLDObject
	Address *jsonLDAddress `json:"address,omitempty"`
	Name    string         `json:"name,omitempty"`
}

type jsonLDAddress struct {
	jsonLDObject
	Address  string `json:"streetAddress,omitempty"`
	Address2 string `json:"extendedAddress,omitempty"`
	City     string `json:"addressLocality,omitempty"`
	State    string `json:"addressRegion,omitempty"`
	Postal   string `json:"postalCode,omitempty"`
	Country  string `json:"addressCountry,omitempty"`
}

type optionalSlice[T any] []T

func (o optionalSlice[T]) MarshalJSON() ([]byte, error) {
	if len(o) == 1 {
		return json.Marshal(o[0])
	} else {
		plainSlice := []T(o)
		return json.Marshal(plainSlice)
	}
}

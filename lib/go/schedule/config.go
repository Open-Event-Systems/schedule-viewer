package schedule

import (
	"errors"

	"github.com/goccy/go-json"
)

// A schedule configuration object.
type Config struct {
	Id                string                  `json:"id"`
	Title             string                  `json:"title"`
	Items             []ItemOrURL             `json:"items"`
	LocationAddresses []*LocationAddressEntry `json:"locationAddresses,omitempty"`
}

type ItemOrURL struct {
	Item *Item
	URL  string
}

func (o *ItemOrURL) UnmarshalJSON(data []byte) error {
	var item Item
	var err error
	if err = json.Unmarshal(data, &item); err == nil {
		o.Item = &item
		return nil
	}

	var asStr string
	if err = json.Unmarshal(data, &asStr); err == nil {
		o.URL = asStr
		return nil
	}

	return err
}

type Address struct {
	Address  string `json:"address,omitempty"`
	Address2 string `json:"address2,omitempty"`
	City     string `json:"city,omitempty"`
	State    string `json:"state,omitempty"`
	Postal   string `json:"postal,omitempty"`
	Country  string `json:"country,omitempty"`
}

// A location address entry.
// May be deserialized as either an object or a tuple.
type LocationAddressEntry struct {
	Location SliceOrScalar[string] `json:"location"`
	Address  Address               `json:"address"`
}

var errLocAddressEntry = errors.New("invalid location address entry")


func (e *LocationAddressEntry) UnmarshalJSON(data []byte) error {
	var locs SliceOrScalar[string]
	var addr Address
	asArray := [2]any{&locs, &addr}
	var sliceErr error

	if sliceErr = json.Unmarshal(data, &asArray); sliceErr == nil {
		if len(asArray) == 2 {
			e.Location = locs
			e.Address = addr
			return nil
		} else {
			sliceErr = errLocAddressEntry
		}
	}

	type plainStruct struct {
		Location SliceOrScalar[string] `json:"location"`
		Address  Address               `json:"address"`
	}

	var asStruct plainStruct
	var structErr error
	if structErr = json.Unmarshal(data, &asStruct); structErr == nil {
		*e = LocationAddressEntry(asStruct)
		return nil
	}

	return errors.Join(sliceErr, structErr)
}


// func (e *LocationAddressEntry) UnmarshalJSON(data []byte) error {
// 	var locs Locations
// 	var addr Address
// 	asSlice := []any{&locs, &addr}
// 	var sliceErr error

// 	if sliceErr = json.Unmarshal(data, &asSlice); sliceErr == nil {
// 		if len(asSlice) == 2 {
// 			e.Location = locs
// 			e.Address = addr
// 			return nil
// 		} else {
// 			sliceErr = errLocAddressEntry
// 		}
// 	}

// 	type plainStruct struct {
// 		Location Locations `json:"location"`
// 		Address  Address   `json:"address"`
// 	}

// 	var asStruct plainStruct
// 	var structErr error
// 	if structErr = json.Unmarshal(data, &asStruct); structErr == nil {
// 		*e = LocationAddressEntry(asStruct)
// 		return nil
// 	}

// 	return errors.Join(sliceErr, structErr)
// }

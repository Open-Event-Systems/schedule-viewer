package schedule

import "github.com/goccy/go-json"

type Config struct {
	Id    string      `json:"id"`
	Title string      `json:"title"`
	Items []ItemOrURL `json:"items"`
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

package structs

import "encoding/json"

type ScheduleConfig struct {
	URL string `json:"url"`
}

type EventsResponse struct {
	Events []Event `json:"events"`
}

type Event struct {
	Id          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Start       string `json:"start"`
	End         string `json:"end"`
	Location    string `json:"location"`
	Hosts       []Host `json:"hosts"`
}

type Host struct {
	Name string `json:"name"`
	URL  string `json:"url"`
}

type _host struct {
	Name string `json:"name"`
	URL  string `json:"url"`
}

func (h *Host) UnmarshalJSON(data []byte) error {
	var asStr string
	err := json.Unmarshal(data, &asStr)
	if err == nil {
		h.Name = asStr
		return nil
	} else {
		var plainHost _host
		err := json.Unmarshal(data, &plainHost)
		if err != nil {
			return err
		}
		h.Name = plainHost.Name
		h.URL = plainHost.URL
		return nil
	}
}

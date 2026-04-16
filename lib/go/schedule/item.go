package schedule

import "time"

type Item struct {
	Id          string     `json:"id"`
	Type        string     `json:"type"`
	Title       string     `json:"title,omitempty"`
	Description string     `json:"description,omitempty"`
	Start       *time.Time `json:"start,omitempty"`
	End         *time.Time `json:"end,omitempty"`
	Icon        string     `json:"icon,omitempty"`
	Image       string     `json:"image,omitempty"`
}

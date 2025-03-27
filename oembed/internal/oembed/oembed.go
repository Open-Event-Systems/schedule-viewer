package oembed

import "oembed/internal/structs"

type OEmbedData struct {
	Type       string `json:"type"`
	Version    string `json:"version"`
	Title      string `json:"title,omitempty"`
	AuthorName string `json:"author_name,omitempty"`
	AuthorURL  string `json:"author_url,omitempty"`
	HTML       string `json:"html,omitempty"`
}

func GetOEmbed(event *structs.Event) *OEmbedData {
	var authorName string
	var authorURL string

	if len(event.Hosts) > 0 {
		authorName = event.Hosts[0].Name
		authorURL = event.Hosts[0].URL
	}

	return &OEmbedData{
		Type:       "rich",
		Version:    "1.0",
		Title:      event.Title,
		AuthorName: authorName,
		AuthorURL:  authorURL,
		HTML:       event.Description,
	}
}

package structs

type BookmarksRequest struct {
	Events []string `json:"events"`
}

type SessionBookmarksResponse struct {
	Id     string   `json:"id"`
	Date   string   `json:"date"`
	Events []string `json:"events"`
}

type BookmarksResponse struct {
	Id     string   `json:"id"`
	Events []string `json:"events"`
}

type BookmarkCountResponse struct {
	Count int `json:"count"`
}

type EventsResponse struct {
	Events []struct {
		Id string `json:"id"`
	} `json:"events"`
}

type EventSelectionCountsResponse struct {
	Counts map[string]int `json:"counts"`
}

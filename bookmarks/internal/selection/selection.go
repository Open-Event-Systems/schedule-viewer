package selection

import (
	"crypto/md5"
	"encoding/base64"
	"encoding/json"
	"slices"
	"strings"
)

type Selection struct {
	idSet map[string]struct{}
	ids   []string
	hash  string
}

func NewSelection(eventIds []string) *Selection {
	idSet := make(map[string]struct{})
	idSlice := make([]string, 0)
	for _, id := range eventIds {
		if _, ok := idSet[id]; !ok {
			idSet[id] = struct{}{}
			idSlice = append(idSlice, id)
		}
	}

	return &Selection{idSet: idSet, ids: idSlice}
}

func (s *Selection) GetEventIds() []string {
	ids := make([]string, 0, len(s.ids))
	ids = append(ids, s.ids...)
	return ids
}

func (s *Selection) Hash() string {
	if s.hash != "" {
		return s.hash
	}

	sorted := make([]string, 0, len(s.ids))
	sorted = append(sorted, s.ids...)
	slices.Sort(sorted)

	jsonData, err := json.Marshal(sorted)
	if err != nil {
		panic(err)
	}

	h := md5.New()
	h.Write(jsonData)
	hashBytes := h.Sum(nil)
	hash := base64.URLEncoding.EncodeToString(hashBytes)
	hash = strings.TrimRight(hash, "=")
	s.hash = hash
	return hash
}

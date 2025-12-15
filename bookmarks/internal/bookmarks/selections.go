package bookmarks

import (
	"crypto/md5"
	"encoding/base64"
	"iter"
	"maps"
	"slices"
)

type Selections struct {
	id    string
	items []string
}

const idPrefix = "sel_"

func NewSelections(items iter.Seq[string]) *Selections {
	if items == nil {
		return &Selections{
			items: make([]string, 0),
		}
	}

	itemsMap := make(map[string]struct{}, 0)

	for item := range items {
		itemsMap[item] = struct{}{}
	}

	itemsSlice := make([]string, 0, len(itemsMap))
	itemsSlice = append(itemsSlice, slices.Sorted(maps.Keys(itemsMap))...)

	return &Selections{items: itemsSlice}
}

func (s *Selections) Id() string {
	if s.id != "" {
		return s.id
	}

	h := md5.New()
	for i, item := range s.items {
		if i != 0 {
			h.Write([]byte(","))
		}
		h.Write([]byte(item))
	}

	sumBytes := h.Sum(nil)
	id := base64.RawURLEncoding.EncodeToString(sumBytes)
	id = idPrefix + id

	s.id = id
	return id
}

func (s *Selections) Iter() iter.Seq[string] {
	return slices.Values(s.items)
}

func (s *Selections) Len() int {
	return len(s.items)
}

func (s *Selections) Slice() []string {
	return slices.Clone(s.items)
}

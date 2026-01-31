package selections

import (
	"crypto/md5"
	"encoding/base64"
	"iter"
	"maps"
	"slices"
	"strings"

	"github.com/goccy/go-json"
)

// Immutable set of selected IDs.
type Selections struct {
	id    string
	items map[string]struct{}
}

func NewSelections(items ...string) Selections {
	newMap := make(map[string]struct{}, len(items))
	for _, item := range items {
		newMap[item] = struct{}{}
	}
	return Selections{id: hashItems(newMap), items: newMap}
}

func (s Selections) Add(items ...string) Selections {
	newMap := make(map[string]struct{}, len(s.items)+len(items))

	for item := range s.items {
		newMap[item] = struct{}{}
	}

	for _, item := range items {
		newMap[item] = struct{}{}
	}

	return Selections{id: hashItems(newMap), items: newMap}
}

func (s Selections) Remove(items ...string) Selections {
	newMap := make(map[string]struct{})
	for item := range s.items {
		if !slices.Contains(items, item) {
			newMap[item] = struct{}{}
		}
	}
	return Selections{id: hashItems(newMap), items: newMap}
}

func (s Selections) Has(item string) bool {
	_, ok := s.items[item]
	return ok
}

func (s Selections) Size() int {
	return len(s.items)
}

func (s Selections) Iter() iter.Seq[string] {
	return maps.Keys(s.items)
}

func (s Selections) Slice() []string {
	if s.Size() == 0 {
		return make([]string, 0)
	}
	return slices.Sorted(s.Iter())
}

func (s Selections) String() string {
	return strings.Join(s.Slice(), ", ")
}

func (s Selections) Id() string {
	if s.id == "" {
		return hashItems(nil)
	}
	return s.id
}

func (s Selections) Equal(other Selections) bool {
	return s.Id() == other.Id()
}

func (s Selections) MarshalJSON() ([]byte, error) {
	type jsonObj struct {
		Id    string   `json:"id"`
		Items []string `json:"items"`
	}

	return json.Marshal(jsonObj{Id: s.Id(), Items: s.Slice()})
}

func (s *Selections) UnmarshalJSON(data []byte) error {
	type jsonObj struct {
		Items []string `json:"items"`
	}

	var obj jsonObj

	if err := json.Unmarshal(data, &obj); err != nil {
		return err
	}

	*s = NewSelections(obj.Items...)
	return nil
}

func hashItems(items map[string]struct{}) string {
	sorted := slices.Sorted(maps.Keys(items))

	h := md5.New()
	enc := json.NewEncoder(h)
	if err := enc.Encode(sorted); err != nil {
		panic(err)
	}

	sum := h.Sum(nil)
	return "sel_" + base64.RawURLEncoding.EncodeToString(sum)
}

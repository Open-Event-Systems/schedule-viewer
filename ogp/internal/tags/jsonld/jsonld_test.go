package jsonld_test

import (
	"bytes"
	"ogp/internal/tags"
	"ogp/internal/tags/jsonld"
	"strings"
	"testing"
	"time"

	"github.com/open-event-systems/schedule-viewer/lib/go/schedule"
	"golang.org/x/net/html"
)

func TestJSONLD(t *testing.T) {
	doc := "<html><head></head><body></body></html>"

	parsed, err := html.Parse(strings.NewReader(doc))
	if err != nil {
		t.Error(err)
	}

	config := schedule.Config{
		Title: "Test",
	}

	start := schedule.LocalTime{Time: time.Date(2020, 1, 1, 12, 0, 0, 0, time.Local)}
	end := schedule.LocalTime{Time: start.Add(1 * time.Hour)}

	item := schedule.Item{
		Id:          "item1",
		Type:        "event",
		Title:       "Item 1",
		Description: "Description",
		Start:       &start,
		End:         &end,
		Icon:        "https://example.net/icon.jpg",
		Image:       "https://example.net/image.jpg",
		Location:    schedule.SliceOrScalar[string]{"Loc"},
		Contacts: []schedule.Contact{
			{
				Name: "Person",
				URL:  "https://example.net/person",
			},
		},
	}

	expected := "<html><head><script type=\"application/ld+json\">" +
		"{\"@context\":\"https://schema.org\",\"@type\":\"Event\"," +
		"\"@id\":\"https://example.net/item1\"," +
		"\"eventStatus\":\"https://schema.org/EventScheduled\"," +
		"\"name\":\"Item 1\",\"description\":\"Description\"," +
		"\"startDate\":\"2020-01-01T12:00:00Z\"," +
		"\"endDate\":\"2020-01-01T13:00:00Z\"," +
		"\"location\":{\"@type\":\"Place\",\"address\":{" +
		"\"@type\":\"PostalAddress\",\"streetAddress\":\"1 Example St\"," +
		"\"addressLocality\":\"City\",\"addressRegion\":\"State\"," +
		"\"postalCode\":\"12345\",\"addressCountry\":\"US\"}," +
		"\"name\":\"Loc\"},\"performer\":{\"@type\":\"Person\"," +
		"\"name\":\"Person\",\"url\":\"https://example.net/person\"}," +
		"\"image\":[\"https://example.net/image.jpg\"," +
		"\"https://example.net/icon.jpg\"]," +
		"\"url\":\"https://example.net/item1\"}" +
		"</script></head><body></body></html>"

	ctx := tags.TagContext{
		URL:    "https://example.net/item1",
		Config: config,
		Item:   &item,
		AddressEntries: []*schedule.LocationAddressEntry{
			&schedule.LocationAddressEntry{
				Location: schedule.SliceOrScalar[string]{"Loc"},
				Address: schedule.Address{
					Address: "1 Example St",
					City:    "City",
					State:   "State",
					Country: "US",
					Postal:  "12345",
				},
			},
		},
	}

	ctx.Apply(parsed, jsonld.GetItemTagActions(ctx))

	resBuf := bytes.NewBuffer(nil)
	err = html.Render(resBuf, parsed)
	if err != nil {
		t.Error(err)
	}

	res := resBuf.String()

	if res != expected {
		t.Fatalf("expected %s, got %s", expected, res)
	}
}

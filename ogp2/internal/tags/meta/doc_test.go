package meta_test

import (
	"bytes"
	"ogp/internal/tags"
	"ogp/internal/tags/meta"
	"strings"
	"testing"

	"github.com/open-event-systems/schedule-viewer/lib/go/schedule"
	"golang.org/x/net/html"
)

func TestDocTags(t *testing.T) {
	doc := "<html><head></head><body></body></html>"

	parsed, err := html.Parse(strings.NewReader(doc))
	if err != nil {
		t.Error(err)
	}

	config := schedule.Config{
		Title: "Test",
	}

	item := schedule.Item{
		Id:          "item1",
		Type:        "event",
		Title:       "Item 1",
		Description: "Description",
	}

	expected := "<html><head><title>Item 1 - Test</title>" +
		"<meta name=\"description\" content=\"Description\"/></head><body></body></html>"

	ctx := tags.TagContext{
		URL:    "https://example.net/item1",
		Config: config,
		Item:   &item,
	}

	ctx.Apply(parsed, meta.GetItemTagActions(ctx))

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

func TestDocTagsReplace(t *testing.T) {
	doc := "<html><head><title>Placeholder</title></head><body></body></html>"

	parsed, err := html.Parse(strings.NewReader(doc))
	if err != nil {
		t.Error(err)
	}

	config := schedule.Config{
		Title: "Test",
	}

	item := schedule.Item{
		Id:          "item1",
		Type:        "event",
		Title:       "Item 1",
		Description: "Description",
	}

	expected := "<html><head><title>Item 1 - Test</title>" +
		"<meta name=\"description\" content=\"Description\"/></head><body></body></html>"

	ctx := tags.TagContext{
		URL:    "https://example.net/item1",
		Config: config,
		Item:   &item,
	}

	ctx.Apply(parsed, meta.GetItemTagActions(ctx))

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

package ogp_test

import (
	"bytes"
	"ogp/internal/tags"
	"ogp/internal/tags/ogp"
	"strings"
	"testing"

	"github.com/open-event-systems/schedule-viewer/lib/go/schedule"
	"golang.org/x/net/html"
)

func TestOGPTags(t *testing.T) {
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
		Icon:        "https://example.net/icon.png",
	}

	expected := "<html><head><meta property=\"og:type\" content=\"article\"/>" +
		"<meta property=\"og:url\" content=\"https://example.net/item1\"/>" +
		"<meta property=\"og:site_name\" content=\"Test\"/>" +
		"<meta property=\"og:title\" content=\"Item 1\"/>" +
		"<meta property=\"og:description\" content=\"Description\"/>" +
		"<meta property=\"og:image\" content=\"https://example.net/icon.png\"/>" +
		"<meta property=\"og:image:type\" content=\"image/png\"/>" +
		"</head><body></body></html>"

	ctx := tags.TagContext{
		URL:    "https://example.net/item1",
		Config: config,
		Item:   &item,
	}

	ctx.Apply(parsed, ogp.GetBaseTagActions(ctx), ogp.GetItemTagActions(ctx))

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

func TestOGPTagReplace(t *testing.T) {
	doc := "<html><head><meta property=\"og:type\" content=\"article\"/>" +
		"<meta property=\"og:url\" content=\"https://example.net/item1\"/>" +
		"<meta property=\"og:site_name\" content=\"Default Site Name\"/>" +
		"<meta property=\"og:title\" content=\"Default Title\"/>" +
		"<meta property=\"og:description\" content=\"Default Description\"/>" +
		"<meta property=\"og:image\" content=\"https://example.net/other.jpg\"/>" +
		"<meta property=\"og:image:type\" content=\"image/jpeg\"/>" +
		"</head><body></body></html>"

	parsed, err := html.Parse(strings.NewReader(doc))
	if err != nil {
		t.Error(err)
	}

	config := schedule.Config{
		Title: "Test",
	}

	item := schedule.Item{
		Id:    "item1",
		Type:  "event",
		Title: "Item 1",
		Icon:  "https://example.net/icon.png",
	}

	expected := "<html><head><meta property=\"og:description\" content=\"Default Description\"/>" +
		"<meta property=\"og:type\" content=\"article\"/>" +
		"<meta property=\"og:url\" content=\"https://example.net/item1\"/>" +
		"<meta property=\"og:site_name\" content=\"Test\"/>" +
		"<meta property=\"og:title\" content=\"Item 1\"/>" +
		"<meta property=\"og:image\" content=\"https://example.net/icon.png\"/>" +
		"<meta property=\"og:image:type\" content=\"image/png\"/>" +
		"</head><body></body></html>"

	ctx := tags.TagContext{
		URL:    "https://example.net/item1",
		Config: config,
		Item:   &item,
	}

	ctx.Apply(parsed, ogp.GetBaseTagActions(ctx), ogp.GetItemTagActions(ctx))

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

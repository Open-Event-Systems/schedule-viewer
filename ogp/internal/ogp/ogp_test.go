package ogp_test

import (
	"bytes"
	"oembed/internal/ogp"
	"oembed/internal/structs"
	"testing"

	"golang.org/x/net/html"
)

func TestAddOGPTags(t *testing.T) {
	expected := []byte("<!DOCTYPE html><html><head><meta property=\"og:type\" content=\"article\"/><meta property=\"og:author\" content=\"Person\"/><meta property=\"og:title\" content=\"Event\"/><meta property=\"og:description\" content=\"Test event\"/><meta property=\"og:site_name\" content=\"Test\"/></head><body></body></html>")
	event := &structs.Event{
		Id:          "test",
		Title:       "Event",
		Description: "Test event",
		Hosts: []structs.Host{
			{
				Name: "Person",
			},
		},
	}

	r := bytes.NewBuffer([]byte("<!DOCTYPE html><html><head></head><body></body></html>"))
	w := bytes.NewBuffer(nil)

	doc, err := html.Parse(r)
	if err != nil {
		t.Fatal(err)
	}

	ogp.SetOGTags(doc, "Test", event)
	err = html.Render(w, doc)
	if err != nil {
		t.Fatal(err)
	}

	if !bytes.Equal(w.Bytes(), expected) {
		t.Fatalf("expected %s, got %s", string(expected), string(w.Bytes()))
	}
}

package jsonld

import (
	"fmt"
	"ogp/internal/tags"
	"slices"

	"github.com/goccy/go-json"
	"github.com/open-event-systems/schedule-viewer/lib/go/schedule"
	"golang.org/x/net/html"
	"golang.org/x/net/html/atom"
)

func GetIndexTagActions(ctx tags.TagContext, items []schedule.Item) tags.HeadActionFunc {
	list := jsonLDEventList{
		jsonLDObject: jsonLDObject{
			Context: "https://schema.org",
			Type:    "ItemList",
		},
	}

	for i := range items {
		var url string

		switch items[i].Type {
		case "event":
			url = fmt.Sprintf("%s/events/%s", ctx.URL, items[i].Id)
		case "vendor":
			url = fmt.Sprintf("%s/vendors/%s", ctx.URL, items[i].Id)
		}

		if url == "" {
			continue
		}

		list.Items = append(list.Items, url)
	}

	encoded, err := json.Marshal(list)
	if err != nil {
		panic(err)
	}

	return func(head *html.Node) {
		el := &html.Node{
			Type:     html.ElementNode,
			DataAtom: atom.Script,
			Data:     "script",
			Attr: []html.Attribute{
				{
					Key: "type",
					Val: "application/ld+json",
				},
			},
		}

		text := &html.Node{
			Type: html.TextNode,
			Data: string(encoded),
		}

		el.AppendChild(text)

		head.AppendChild(el)
	}
}

func GetItemTagActions(ctx tags.TagContext) tags.HeadActionFunc {
	var eventType string
	var contactType string

	switch ctx.Item.Type {
	case "event":
		eventType = "ConferenceEvent"
		contactType = "Person"
	case "vendor":
		eventType = "SaleEvent"
		contactType = "Store"
	}

	event := jsonLDEvent{
		jsonLDObject: jsonLDObject{
			Type:    eventType,
			Context: "https://schema.org",
			Id:      ctx.URL,
		},
		Status:      "https://schema.org/EventScheduled",
		URL:         ctx.URL,
		Title:       ctx.Item.Title,
		Description: ctx.Item.Description,
		Start:       ctx.Item.Start,
		End:         ctx.Item.End,
	}

	// default start/end times
	if event.Start == nil {
		event.Start = ctx.Config.Start
	}

	if event.End == nil {
		event.End = ctx.Config.End
	}

	for _, locName := range ctx.Item.Location {
		event.Location = append(event.Location, getLocationObject(ctx.AddressEntries, locName))
	}

	if ctx.Item.Image != "" {
		event.Image = append(event.Image, ctx.Item.Image)
	}

	if ctx.Item.Icon != "" {
		event.Image = append(event.Image, ctx.Item.Icon)
	}

	for _, contact := range ctx.Item.Contacts {
		event.Performer = append(event.Performer, getPerformerObject(contact, contactType))
	}

	encoded, err := json.Marshal(event)
	if err != nil {
		panic(err)
	}

	return func(head *html.Node) {
		el := &html.Node{
			Type:     html.ElementNode,
			DataAtom: atom.Script,
			Data:     "script",
			Attr: []html.Attribute{
				{
					Key: "type",
					Val: "application/ld+json",
				},
			},
		}

		text := &html.Node{
			Type: html.TextNode,
			Data: string(encoded),
		}

		el.AppendChild(text)

		head.AppendChild(el)
	}
}

func getPerformerObject(contact schedule.Contact, contactType string) jsonLDPerson {
	return jsonLDPerson{
		jsonLDObject: jsonLDObject{
			Type: contactType,
		},
		Name: contact.Name,
		URL:  contact.URL,
	}
}

func getLocationObject(entries []*schedule.LocationAddressEntry, locName string) jsonLDPlace {
	place := jsonLDPlace{
		jsonLDObject: jsonLDObject{
			Type: "Place",
		},
		Name: locName,
	}

	addr := getLocationAddress(entries, locName)

	if addr != nil {
		place.Address = &jsonLDAddress{
			jsonLDObject: jsonLDObject{
				Type: "PostalAddress",
			},
			Address:  addr.Address,
			Address2: addr.Address2,
			City:     addr.City,
			State:    addr.State,
			Postal:   addr.Postal,
			Country:  addr.Country,
		}
	}

	return place
}

func getLocationAddress(entries []*schedule.LocationAddressEntry, loc string) *schedule.Address {
	var defaultAddr *schedule.Address

	for _, entry := range entries {
		if len(entry.Location) == 0 {
			defaultAddr = &entry.Address
		}

		if slices.Contains(entry.Location, loc) {
			return &entry.Address
		}
	}

	return defaultAddr
}

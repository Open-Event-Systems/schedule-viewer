package tags

import (
	"github.com/open-event-systems/schedule-viewer/lib/go/schedule"
	"golang.org/x/net/html"
)

type TagContext struct {
	URL    string
	Config schedule.Config
	Item   *schedule.Item
	AddressEntries []*schedule.LocationAddressEntry
}

func (c TagContext) Apply(doc *html.Node, actions ...DocumentAction) {
	head := GetHead(doc)

	for _, action := range actions {
		if headAction, ok := action.(HeadAction); ok && head != nil {
			headAction.Apply(head)
		} else {
			action.Apply(doc)
		}
	}
}

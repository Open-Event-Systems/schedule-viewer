package ogp

import (
	"ogp/internal/tags"
	"path"
	"slices"
	"strings"

	"golang.org/x/net/html"
	"golang.org/x/net/html/atom"
)

func GetBaseTagActions(ctx tags.TagContext) tags.HeadActionFunc {
	actions := make([]tags.HeadAction, 0, 3)

	actions = append(actions, makeAddOGPTagFunc("og:type", "article"))

	if ctx.URL != "" {
		actions = append(actions, makeAddOGPTagFunc("og:url", ctx.URL))
	}

	if ctx.Config.Title != "" {
		actions = append(actions, makeAddOGPTagFunc("og:site_name", ctx.Config.Title))
	}

	return func(head *html.Node) {
		for _, action := range actions {
			action.Apply(head)
		}
	}
}

func GetItemTagActions(ctx tags.TagContext) tags.HeadActionFunc {
	actions := make([]tags.HeadAction, 0, 4)

	var title string

	if ctx.Config.Title != "" {
		title = ctx.Item.Title
	} else {
		title = ctx.Config.Title
	}

	if title != "" {
		actions = append(actions, makeAddOGPTagFunc("og:title", title))
	}

	if ctx.Item.Description != "" {
		actions = append(actions, makeAddOGPTagFunc("og:description", ctx.Item.Description))
	}

	if ctx.Item.Icon != "" {
		actions = append(actions, makeAddOGPImageFunc(ctx.Item.Icon))
	}

	return func(head *html.Node) {
		for _, action := range actions {
			action.Apply(head)
		}
	}
}

func makeOGPTag(prop string, content string) *html.Node {
	return &html.Node{
		Type:     html.ElementNode,
		DataAtom: atom.Meta,
		Data:     "meta",
		Attr: []html.Attribute{
			{
				Key: "property",
				Val: prop,
			},
			{
				Key: "content",
				Val: content,
			},
		},
	}
}

func makeAddOGPTagFunc(prop string, value string) tags.HeadActionFunc {
	return func(head *html.Node) {
		toRemove := slices.Collect(tags.FindElements(head, makeMatchOGPProp(prop)))
		for _, el := range toRemove {
			el.Parent.RemoveChild(el)
		}

		head.AppendChild(makeOGPTag(prop, value))
	}
}

func makeMatchOGPProp(prop string) func(el *html.Node) bool {
	prefix := prop + ":"
	return func(el *html.Node) bool {
		if el.DataAtom != atom.Meta {
			return false
		}

		for _, attr := range el.Attr {
			if attr.Key == "property" && (attr.Val == prop || strings.HasPrefix(attr.Val, prefix)) {
				return true
			}
		}

		return false
	}
}

func makeAddOGPImageFunc(imageURL string) tags.HeadActionFunc {
	ext := strings.ToLower(path.Ext(imageURL))
	mime := extTypeMap[ext]

	return func(head *html.Node) {
		toRemove := slices.Collect(tags.FindElements(head, makeMatchOGPProp("og:image")))
		for _, el := range toRemove {
			el.Parent.RemoveChild(el)
		}

		head.AppendChild(makeOGPTag("og:image", imageURL))
		if mime != "" {
			head.AppendChild(makeOGPTag("og:image:type", mime))
		}
	}
}


var extTypeMap = map[string]string{
	".jpg":  "image/jpeg",
	".jpeg": "image/jpeg",
	".png":  "image/png",
	".webp": "image/webp",
	".avif": "image/avif",
}

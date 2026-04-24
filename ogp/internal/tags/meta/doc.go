package meta

import (
	"fmt"
	"ogp/internal/tags"
	"slices"

	"golang.org/x/net/html"
	"golang.org/x/net/html/atom"
)

func GetItemTagActions(ctx tags.TagContext) tags.HeadActionFunc {
	title := getTitleItemTagAction(ctx)
	desc := getDescriptionItemTagAction(ctx)
	return func(head *html.Node) {
		title(head)
		desc(head)
	}
}

func getTitleItemTagAction(ctx tags.TagContext) tags.HeadActionFunc {
	var title string

	if ctx.Item.Title != "" && ctx.Config.Title != "" {
		title = fmt.Sprintf("%s - %s", ctx.Item.Title, ctx.Config.Title)
	} else {
		title = ctx.Config.Title
	}

	return func(head *html.Node) {
		if title != "" {
			titleEl := tags.FindElementByTag(head, atom.Title)

			if titleEl == nil {
				titleEl = &html.Node{
					Type:     html.ElementNode,
					DataAtom: atom.Title,
					Data:     "title",
				}
				head.AppendChild(titleEl)
			} else {
				toRemove := slices.Collect(titleEl.ChildNodes())
				for _, node := range toRemove {
					node.Parent.RemoveChild(node)
				}
			}

			titleEl.AppendChild(&html.Node{
				Type: html.TextNode,
				Data: title,
			})
		}
	}
}

func getDescriptionItemTagAction(ctx tags.TagContext) tags.HeadActionFunc {
	return func(head *html.Node) {
		if ctx.Item.Description != "" {

			matchFunc := func(el *html.Node) bool {
				if el.DataAtom != atom.Meta {
					return false
				}

				for _, attr := range el.Attr {
					if attr.Key == "name" && attr.Val == "description" {
						return true
					}
				}

				return false
			}

			var descEl *html.Node

			for descEl = range tags.FindElements(head, matchFunc) {
				break
			}

			if descEl == nil {
				descEl = &html.Node{
					Type:     html.ElementNode,
					DataAtom: atom.Meta,
					Data:     "meta",
					Attr: []html.Attribute{
						{
							Key: "name",
							Val: "description",
						},
						{
							Key: "content",
							Val: ctx.Item.Description,
						},
					},
				}
				head.AppendChild(descEl)
			} else {
				newAttrs := slices.Clone(descEl.Attr)
				newAttrs = slices.DeleteFunc(newAttrs, func(attr html.Attribute) bool {
					return attr.Key == "content"
				})
				newAttrs = append(newAttrs, html.Attribute{
					Key: "content",
					Val: ctx.Item.Description,
				})

				descEl.Attr = newAttrs
			}
		}
	}
}

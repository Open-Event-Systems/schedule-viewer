package ogp

import (
	"oembed/internal/structs"

	"golang.org/x/net/html"
)

func CopyNode(node *html.Node) *html.Node {
	newNode := html.Node{
		Type:      node.Type,
		DataAtom:  node.DataAtom,
		Data:      node.Data,
		Namespace: node.Namespace,
		Attr:      make([]html.Attribute, 0, len(node.Attr)),
	}

	for _, attr := range node.Attr {
		newNode.Attr = append(newNode.Attr, attr)
	}

	for child := range node.ChildNodes() {
		newNode.AppendChild(CopyNode(child))
	}

	return &newNode
}

func SetOGTags(root *html.Node, siteTitle string, event *structs.Event) {
	var els []*html.Node

	els = append(els, createOGTag("og:type", "article"))

	for _, host := range event.Hosts {
		// not standard
		els = append(els, createOGTag("og:author", host.Name))
	}

	if event.Title != "" {
		els = append(els, createOGTag("og:title", event.Title))
	}

	if event.Description != "" {
		els = append(els, createOGTag("og:description", event.Description))
	}

	if siteTitle != "" {
		els = append(els, createOGTag("og:site_name", siteTitle))
	}

	head := findTag(root, "head")
	if head != nil {
		for _, el := range els {
			head.AppendChild(el)
		}
	}
}

func createOGTag(property string, content string) *html.Node {
	newNode := &html.Node{
		Type: html.ElementNode,
		Data: "meta",
		Attr: []html.Attribute{
			{Key: "property", Val: property},
			{Key: "content", Val: content},
		},
	}
	return newNode
}

func findTag(root *html.Node, tag string) *html.Node {
	if root.Type == html.ElementNode && root.Data == tag {
		return root
	} else {
		for child := range root.ChildNodes() {
			res := findTag(child, tag)
			if res != nil {
				return res
			}
		}
		return nil
	}
}

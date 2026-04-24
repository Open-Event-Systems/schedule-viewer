package tags

import "golang.org/x/net/html"

type DocumentAction interface {
	Apply(doc *html.Node)
}

type DocumentActionFunc func(doc *html.Node)

func (d DocumentActionFunc) Apply(doc *html.Node) {
	d(doc)
}

type HeadAction DocumentAction

type HeadActionFunc func(head *html.Node)

func (h HeadActionFunc) Apply(head *html.Node) {
	h(head)
}

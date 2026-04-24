package tags

import (
	"iter"

	"golang.org/x/net/html"
	"golang.org/x/net/html/atom"
)

func GetHead(doc *html.Node) *html.Node {
	return FindElementByTag(doc, atom.Head)
}

func FindElementByTag(doc *html.Node, tag atom.Atom) *html.Node {
	for el := range FindElementsByTag(doc, tag) {
		return el
	}
	return nil
}

func FindElementsByTag(doc *html.Node, tag atom.Atom) iter.Seq[*html.Node] {
	match := func(el *html.Node) bool {
		return el.DataAtom == tag
	}

	return FindElements(doc, match)
}

type ElementMatchFunc func(el *html.Node) bool

func FindElements(doc *html.Node, match ElementMatchFunc) iter.Seq[*html.Node] {
	return func(yield func(*html.Node) bool) {
		FindElementsIter(doc, match, yield)
	}
}

func FindElementsIter(doc *html.Node, match ElementMatchFunc, yield func(node *html.Node) bool) bool {
	if doc == nil {
		return true
	}

	if doc.Type == html.ElementNode || doc.Type == html.DocumentNode {
		if match(doc) {
			if !yield(doc) {
				return false
			}
		}

		for child := range doc.ChildNodes() {
			if !FindElementsIter(child, match, yield) {
				return false
			}
		}
	}

	return true
}

package sitemap

import (
	"encoding/xml"
	"fmt"
	"io"

	"github.com/open-event-systems/schedule-viewer/lib/go/schedule"
)

const xmlNS = "http://www.sitemaps.org/schemas/sitemap/0.9"

type urlset struct {
	XMLName xml.Name `xml:"urlset"`
	XMLNS   string   `xml:"xmlns,attr"`
	URLs    []url    `xml:"url"`
}

type url struct {
	Location string `xml:"loc"`
}

func WriteSiteMap(w io.Writer, baseURL string, items []schedule.Item) error {
	seenIds := make(map[string]struct{}, len(items))

	var urls []url

	for _, item := range items {
		if _, ok := seenIds[item.Id]; ok {
			continue
		}

		seenIds[item.Id] = struct{}{}

		switch item.Type {
		case "event":
			urls = append(urls, url{
				Location: fmt.Sprintf("%s/events/%s", baseURL, item.Id),
			})
		case "vendor":
			urls = append(urls, url{
				Location: fmt.Sprintf("%s/vendors/%s", baseURL, item.Id),
			})
		}
	}

	urlset := urlset{
		XMLNS: xmlNS,
		URLs:  urls,
	}

	_, err := w.Write([]byte(xml.Header))
	if err != nil {
		return err
	}

	enc := xml.NewEncoder(w)
	return enc.Encode(urlset)
}

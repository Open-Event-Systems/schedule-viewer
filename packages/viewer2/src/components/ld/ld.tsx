import { useLayoutEffect, useMemo } from "react"
import { useViewerConfig } from "../../config.js"
import type { DetailedScheduleItem } from "@open-event-systems/schedule-lib"
import { makeLocationAddressMatchFunc } from "../../schedule.js"

export const JSONLD = ({
  children,
}: {
  children?: Readonly<Record<string, unknown>>
}) => {
  useLayoutEffect(() => {
    if (!children) {
      return
    }

    const jsonStr = JSON.stringify(children)
    const el = document.createElement("script")
    el.setAttribute("type", "application/ld+json")
    el.innerHTML = jsonStr

    document.head.appendChild(el)

    return () => {
      el.remove()
    }
  }, [children])

  return null
}

export const JSONLDEvent = ({
  event,
  url,
}: {
  event: DetailedScheduleItem
  url: string
}) => {
  const config = useViewerConfig()

  const matchAddr = useMemo(
    () => makeLocationAddressMatchFunc(config.locationAddresses),
    [config.locationAddresses],
  )

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": event.type == "vendor" ? "SaleEvent" : "ConferenceEvent",
    eventStatus: "https://schema.org/EventScheduled",
    url,
  }

  if (event.start) {
    data.startDate = event.start.toISOString()
  }

  if (event.end) {
    data.endDate = event.end.toISOString()
  }

  if (event.title) {
    data.name = event.title
  }

  if (event.description) {
    data.description = event.description
  }

  if (event.contacts && event.contacts.length > 0) {
    const people = []

    for (const contact of event.contacts) {
      people.push({
        "@type": event.type == "vendor" ? "Store" : "Person",
        name: contact.name,
        url: contact.url,
      })
    }

    data.performer = people.length > 1 ? people : people[0]
  }

  if (event.location && event.location.length > 0) {
    const locs = []

    for (const loc of event.location) {
      const addr = matchAddr(loc)
      if (addr) {
        locs.push({
          "@type": "Place",
          name: loc,
          address: {
            "@type": "PostalAddress",
            streetAddress: addr.address,
            extendedAddress: addr.address2,
            addressLocality: addr.city,
            postalCode: addr.postal,
            addressRegion: addr.state,
            addressCountry: addr.country,
          },
        })
      }
    }

    data.location = locs.length > 1 ? locs : locs[0]
  }

  return <JSONLD>{data}</JSONLD>
}

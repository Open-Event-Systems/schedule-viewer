import { use, useLayoutEffect, useMemo } from "react"
import { useViewerConfig } from "../../config.js"
import type { DetailedScheduleItem } from "@open-event-systems/schedule-lib"
import { makeLocationAddressMatchFunc } from "../../schedule.js"
import { InitialHeadContext } from "../head/deduped-head.js"
import { format } from "date-fns"

export const JSONLD = ({
  children,
}: {
  children?: Readonly<Record<string, unknown>>
}) => {
  const initialHead = use(InitialHeadContext)
  useLayoutEffect(() => {
    if (!children) {
      return
    }

    const jsonStr = JSON.stringify(children)
    const el = document.createElement("script")
    el.setAttribute("type", "application/ld+json")
    el.innerHTML = jsonStr

    // remove any initial ld+json elements

    const toRemove = []

    for (const el of initialHead) {
      if (
        el.tagName == "SCRIPT" &&
        el.getAttribute("type") == "application/ld+json"
      ) {
        toRemove.push(el)
      }
    }

    for (const el of toRemove) {
      el.remove()
      const idx = toRemove.indexOf(el)
      toRemove.splice(idx, 1)
    }

    document.head.appendChild(el)

    return () => {
      el.remove()
    }
  }, [children, initialHead])

  return null
}

export const JSONLDItems = ({
  items,
  getItemURL,
}: {
  items?: Iterable<DetailedScheduleItem>
  getItemURL: (item: DetailedScheduleItem) => string
}) => {
  const itemData = []

  for (const item of items ?? []) {
    itemData.push(getItemURL(item))
  }

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: itemData,
  }

  return <JSONLD>{data}</JSONLD>
}

export const JSONLDItem = ({
  event,
  url,
  defaultStart,
  defaultEnd,
}: {
  event: DetailedScheduleItem
  url: string
  defaultStart?: Date
  defaultEnd?: Date
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

  if (event.start || defaultStart) {
    data.startDate = format(
      event.start || defaultStart!,
      "yyyy-MM-dd'T'HH:mm:ss",
    )
  }

  if (event.end || defaultEnd) {
    data.endDate = format(event.end || defaultEnd!, "yyyy-MM-dd'T'HH:mm:ss")
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

import type { Bounded, ScheduleItem, ScheduleItemDetails } from "./types.js"
import * as ics from "ics"

/**
 * Create an iCalenar file containing the provided events.
 *
 * @param events - The events
 * @param prefix - A prefix used to build event UIDs
 * @param domain - A domain added to event UIDs
 */
export const createICS = (
  events: Iterable<
    Bounded<
      ScheduleItem &
        Pick<ScheduleItemDetails, "title" | "description" | "location">
    >
  >,
  prefix: string,
  domain: string,
): string => {
  const now = new Date()
  const eventAttrs: ics.EventAttributes[] = []
  for (const event of events) {
    const attrs: ics.EventAttributes = {
      uid: `${prefix}-${event.id}@${domain}`,
      start: event.start.getTime(),
      end: event.end.getTime(),
      lastModified: now.getTime(),
    }

    if (event.title) {
      attrs.title = event.title
    }

    if (event.description) {
      attrs.description = event.description
    }

    if (event.location && event.location.length > 0) {
      attrs.location = event.location.join(", ")
    }

    eventAttrs.push(attrs)
  }

  return ics.createEvents(eventAttrs).value || ""
}

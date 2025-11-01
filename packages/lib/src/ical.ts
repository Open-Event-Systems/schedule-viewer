import type { Bounded, ScheduleItem } from "./types.js"
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
        Readonly<{
          title?: string
          description?: string
          location?: string
        }>
    >
  >,
  prefix: string,
  domain: string,
): string => {
  const eventAttrs: ics.EventAttributes[] = []
  for (const event of events) {
    const attrs: ics.EventAttributes = {
      uid: `${prefix}-${event.id}@${domain}`,
      start: event.start.getTime(),
      end: event.end.getTime(),
    }

    if (event.title) {
      attrs.title = event.title
    }

    if (event.description) {
      attrs.description = event.description
    }

    if (event.location) {
      attrs.location = event.location
    }

    eventAttrs.push(attrs)
  }

  return ics.createEvents(eventAttrs).value || ""
}

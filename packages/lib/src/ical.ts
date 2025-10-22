import { Bounded, ScheduleItem } from "./types.js"
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
        Readonly<{ title?: string; description?: string; location?: string }>
    >
  >,
  prefix: string,
  domain: string,
): string => {
  const eventAttrs: ics.EventAttributes[] = []
  for (const event of events) {
    eventAttrs.push({
      uid: `${prefix}-${event.id}@${domain}`,
      start: event.start.getTime(),
      end: event.end.getTime(),
      title: event.title,
      description: event.description,
      location: event.location,
    })
  }

  return ics.createEvents(eventAttrs).value || ""
}

import { Event, Scheduled } from "@open-event-systems/schedule-lib"
import * as ics from "ics"

declare module "@open-event-systems/schedule-lib" {
  interface ScheduleConfig {
    icalPrefix?: string
    icalDomain?: string
  }
}

export const createICS = (
  events: Iterable<Scheduled<Event>>,
  prefix: string,
  domain: string
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

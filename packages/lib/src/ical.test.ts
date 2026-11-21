import { indexScheduleData } from "#src/data.js"
import { parseISO } from "#src/date.js"
import { createICS } from "#src/ical.js"
import { ContactRole, ScheduleEventStatus, type ScheduleItemSeries } from "#src/types.js"
import { describe, expect, test } from "vitest"

describe("ical generation", () => {
  test("standard ical event generation", () => {
    const occ: ScheduleItemSeries = {
      item: {
        id: "item1",
        type: "event",
        name: "Item 1",
        description: "Example item 1.",
        alternateNames: [],
        contacts: [
          {
            role: ContactRole.organizer,
            name: "Example Person 1",
          },
          {
            role: ContactRole.organizer,
            name: "Example Person 2",
          },
        ],
        eventStatus: ScheduleEventStatus.scheduled,
        images: [],
        tags: new Set(),
        urls: [],
      },
      occurrences: [
        {
          id: "item1-occ1",
          eventStatus: ScheduleEventStatus.scheduled,
          locations: [{ name: "Loc 1" }, { name: "Loc 2" }],
          startDate: parseISO("2027-01-01T12:00:00-05:00"),
          endDate: parseISO("2027-01-01T13:00:00-05:00"),
        },
      ],
    }

    const now = parseISO("2026-12-31T12:00:00-05:00")

    const calendar = createICS([occ], indexScheduleData(), {
      scheduleId: "https://example.net/schedule",
      baseURL: "https://example.net",
      name: "Example Schedule",
      now: now,
      timeZone: "America/New_York",
    })

    const expected = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//sebbo.net//ical-generator//EN
NAME:Example Schedule
X-WR-CALNAME:Example Schedule
TIMEZONE-ID:America/New_York
X-WR-TIMEZONE:America/New_York
BEGIN:VEVENT
UID:https://example.net/schedule#item1-occ1
SEQUENCE:0
DTSTAMP:20261231T120000
DTSTART;TZID=America/New_York:20270101T120000
DTEND;TZID=America/New_York:20270101T130000
SUMMARY:Item 1
LOCATION:Loc 1\\, Loc 2
DESCRIPTION:Example item 1.
STATUS:CONFIRMED
LAST-MODIFIED:20261231T120000
END:VEVENT
END:VCALENDAR`.replaceAll("\n", "\r\n")

    expect(calendar).toBe(expected)
  })

  test("recurring event", () => {
    const occ: ScheduleItemSeries = {
      item: {
        id: "item1",
        type: "event",
        name: "Item 1",
        description: "Example item 1.",
        alternateNames: [],
        contacts: [
          {
            role: ContactRole.organizer,
            name: "Example Person 1",
          },
          {
            role: ContactRole.organizer,
            name: "Example Person 2",
          },
        ],
        eventStatus: ScheduleEventStatus.scheduled,
        images: [],
        tags: new Set(),
        urls: [],
      },
      occurrences: [
        {
          id: "item1-occ1",
          eventStatus: ScheduleEventStatus.scheduled,
          locations: [{ name: "Loc 1" }, { name: "Loc 2" }],
          startDate: parseISO("2027-01-01T12:00:00-05:00"),
          endDate: parseISO("2027-01-01T13:00:00-05:00"),
        },
        {
          id: "item1-occ2",
          eventStatus: ScheduleEventStatus.scheduled,
          locations: [{ name: "Loc 3" }],
          startDate: parseISO("2027-01-01T15:00:00-05:00"),
          endDate: parseISO("2027-01-01T16:00:00-05:00"),
        },
      ],
    }

    const now = parseISO("2026-12-31T12:00:00-05:00")

    const calendar = createICS([occ], indexScheduleData(), {
      scheduleId: "https://example.net/schedule",
      baseURL: "https://example.net",
      name: "Example Schedule",
      now: now,
      timeZone: "America/New_York",
    })

    const expected = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//sebbo.net//ical-generator//EN
NAME:Example Schedule
X-WR-CALNAME:Example Schedule
TIMEZONE-ID:America/New_York
X-WR-TIMEZONE:America/New_York
BEGIN:VEVENT
UID:https://example.net/schedule#item1-occ1
SEQUENCE:0
DTSTAMP:20261231T120000
DTSTART;TZID=America/New_York:20270101T120000
DTEND;TZID=America/New_York:20270101T130000
SUMMARY:Item 1
LOCATION:Loc 1\\, Loc 2
DESCRIPTION:Example item 1.
STATUS:CONFIRMED
LAST-MODIFIED:20261231T120000
END:VEVENT
BEGIN:VEVENT
UID:https://example.net/schedule#item1-occ2
SEQUENCE:0
DTSTAMP:20261231T120000
DTSTART;TZID=America/New_York:20270101T150000
DTEND;TZID=America/New_York:20270101T160000
SUMMARY:Item 1
LOCATION:Loc 3
DESCRIPTION:Example item 1.
STATUS:CONFIRMED
LAST-MODIFIED:20261231T120000
END:VEVENT
END:VCALENDAR`.replaceAll("\n", "\r\n")

    expect(calendar).toBe(expected)
  })
})

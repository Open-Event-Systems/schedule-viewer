import { indexScheduleData } from "#src/data.js"
import { parseDuration, parseISO } from "#src/date.js"
import { eventSchema, locationSchema, profileSchema } from "#src/parse/json.js"
import {
  ScheduleEventStatus,
  type Location,
  type Profile,
  type ScheduleEvent,
  type ScheduleItemSeries,
} from "#src/types.js"

export const testPeopleData = {
  person1: profileSchema.decode({
    id: "person1",
    type: "profile",
    name: "Person 1",
    logo: "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png",
    urls: ["#"],
  }),
  person2: profileSchema.decode({
    id: "person2",
    type: "profile",
    name: "Person 2",
  }),
} as const satisfies Record<string, Profile>

export const testLocationData = {
  "main-ballroom": locationSchema.decode({
    id: "main-ballroom",
    type: "location",
    name: "Main Ballroom",
  }),
  "panel-room-1": locationSchema.decode({
    id: "panel-room-1",
    type: "location",
    name: "Panel Room 1",
    alternateNames: ["Room 1"],
  }),
} as const satisfies Record<string, Location>

export const testEventData = {
  event1: {
    item: eventSchema.decode({
      id: "event1",
      type: "event",
      name: "Event 1",
      description: "An example event.",
      contacts: [
        {
          id: "person1",
        },
        {
          name: "Extra Person",
        },
      ],
      tags: ["main-event", "photography"],
    }),
    occurrences: [
      {
        id: "occ1-event1",
        eventStatus: ScheduleEventStatus.scheduled,
        startDate: parseISO("2027-01-16T12:00:00-05:00"),
        endDate: parseISO("2027-01-16T13:00:00-05:00"),
        duration: parseDuration("PT1H"),
        locations: [
          {
            id: "main-ballroom",
          },
        ],
      },
    ],
  },
  event2: {
    item: eventSchema.decode({
      id: "event2",
      type: "event",
      name: "Event 2",
      description: "Another example event.",
      contacts: [
        {
          id: "person2",
        },
      ],
      tags: ["main-event"],
    }),
    occurrences: [
      {
        id: "occ1-event2",
        eventStatus: ScheduleEventStatus.scheduled,
        startDate: parseISO("2027-01-16T12:00:00-05:00"),
        endDate: parseISO("2027-01-16T13:00:00-05:00"),
        duration: parseDuration("PT1H"),
        locations: [
          {
            id: "main-ballroom",
          },
        ],
      },
    ],
  },
  event3: {
    item: eventSchema.decode({
      id: "event3",
      type: "event",
      name: "Event 3",
      description: "Another example event.",
      contacts: [
        {
          id: "person1",
        },
      ],
      tags: ["photography"],
    }),
    occurrences: [
      {
        id: "occ1-event3",
        eventStatus: ScheduleEventStatus.scheduled,
        startDate: parseISO("2027-01-17T13:00:00-05:00"),
        endDate: parseISO("2027-01-17T14:00:00-05:00"),
        duration: parseDuration("PT1H"),
        locations: [
          {
            id: "panel-room-1",
          },
        ],
      },
    ],
  },
  event4: {
    item: eventSchema.decode({
      id: "event4",
      type: "event",
      name: "Example Series",
      description: "An example event series.",
      contacts: [
        {
          id: "person1",
        },
      ],
      tags: ["photography"],
    }),
    occurrences: [
      {
        id: "occ1-event4",
        eventStatus: ScheduleEventStatus.scheduled,
        startDate: parseISO("2027-01-16T10:00:00-05:00"),
        endDate: parseISO("2027-01-16T12:00:00-05:00"),
        duration: parseDuration("PT1H"),
        locations: [
          {
            id: "panel-room-1",
          },
        ],
      },
      {
        id: "occ1-event5",
        eventStatus: ScheduleEventStatus.scheduled,
        startDate: parseISO("2027-01-17T16:00:00-05:00"),
        endDate: parseISO("2027-01-17T18:00:00-05:00"),
        duration: parseDuration("PT1H"),
        locations: [
          {
            name: "Room 1",
          },
        ],
      },
    ],
  },
} as const satisfies { [key: string]: ScheduleItemSeries<ScheduleEvent> }

export const testData = indexScheduleData([
  ...Object.values(testEventData),
  ...Array.from(Object.values(testPeopleData), (p) => ({
    item: p,
    occurrences: [],
  })),
  ...Array.from(Object.values(testLocationData), (loc) => ({
    item: loc,
    occurrences: [],
  })),
])

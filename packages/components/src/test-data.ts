import { TZDate } from "@date-fns/tz"
import { Event, ScheduleConfig } from "@open-event-systems/schedule-lib"

const timeZone = "America/New_York"

export const events = [
  {
    id: "opening-ceremonies",
    title: "Opening Ceremonies",
    description: "Join us as we kick off another year of our annual event.",
    start: new TZDate(2025, 0, 17, 11, timeZone),
    end: new TZDate(2025, 0, 17, 12, timeZone),
    location: "Main Ballroom",
    tags: ["main-event"],
    hosts: ["Events Team"],
  },
  {
    id: "photography-meetup",
    title: "Photography Meetup",
    description: "A meetup for amateur and professional photographers.",
    start: new TZDate(2025, 0, 18, 12, timeZone),
    end: new TZDate(2025, 0, 18, 13, timeZone),
    location: "Panel Room 1",
    tags: ["photography", "hobby"],
    hosts: [{ name: "Person", url: "https://example.net" }],
  },
  {
    id: "figure-drawing",
    title: "Figure Drawing",
    description: "A live figure drawing demonstration.",
    start: new TZDate(2025, 0, 18, 14, timeZone),
    end: new TZDate(2025, 0, 18, 16, 30, timeZone),
    location: "Panel Room 2",
    tags: ["art", "mature"],
    hosts: [
      { name: "Artist", url: "https://example.net" },
      { name: "Model", url: "https://example.net" },
    ],
  },
] satisfies readonly Event[]

export const config = {
  id: "example-event",
  title: "Example Event",
  dayChangeHour: 6,
  tags: [
    ["main-event", "Main Event"],
    ["hobby", "Hobby"],
    ["photography", "Photography"],
    ["art", "Art"],
    ["mature", "Mature"],
  ],
  tagIndicators: [["mature", "18+"]],
  timeZone,
} satisfies Partial<ScheduleConfig>

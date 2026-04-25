import {
  parseScheduleEvent,
  type ScheduleEvent,
} from "@open-event-systems/schedule-lib"
import { parseConfig, type ScheduleConfigInput } from "./config.js"

const timeZone = "America/New_York"

export const events = [
  {
    id: "opening-ceremonies",
    type: "event",
    title: "Opening Ceremonies",
    description: "Join us as we kick off another year of our annual event.",
    start: new Date(2025, 0, 17, 11),
    end: new Date(2025, 0, 17, 12),
    location: ["Main Ballroom"],
    tags: new Set(["main-event"]),
    contacts: [{ name: "Events Team" }],
  },
  {
    id: "photography-meetup",
    type: "event",
    title: "Photography Meetup",
    description: "A meetup for amateur and professional photographers.",
    start: new Date(2025, 0, 18, 12),
    end: new Date(2025, 0, 18, 13),
    location: ["Panel Room 1"],
    tags: new Set(["photography", "hobby"]),
    contacts: [{ name: "Person", url: "https://example.net" }],
  },
  {
    id: "figure-drawing",
    type: "event",
    title: "Figure Drawing",
    description: "A live figure drawing demonstration.",
    start: new Date(2025, 0, 18, 14),
    end: new Date(2025, 0, 18, 16, 30),
    location: ["Panel Room 2"],
    tags: new Set(["art", "mature"]),
    contacts: [
      { name: "Artist", url: "https://example.net" },
      { name: "Model", url: "https://example.net" },
    ],
  },
] as const satisfies readonly ScheduleEvent[]

export const parsedEvents = events
  .map(parseScheduleEvent)
  .filter((r) => r.success)
  .map((r) => r.value)

export const config = {
  id: "example-event",
  title: "Example Event",
  dayChangeHour: 6,
  start: "2025-01-17T08:00:00-05:00",
  end: "2025-01-18T00:00:00-05:00",
  tags: [
    ["main-event", "Main Event"],
    ["hobby", "Hobby"],
    ["photography", "Photography"],
    ["art", "Art"],
    ["mature", "Mature"],
  ],
  tagIndicators: [["mature", "18+"]],
  timeZone,
} as const satisfies ScheduleConfigInput

export const parsedConfig = parseConfig(config)

export const tagEntries = [
  { tag: "main-event", title: "Main Event" },
  { tag: "hobby", title: "Hobby" },
  { tag: "photography", title: "Photography" },
  { tag: "art", title: "Art" },
  { tag: "mature", title: "Mature" },
] as const

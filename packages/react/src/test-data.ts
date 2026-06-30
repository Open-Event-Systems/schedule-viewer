import { type ScheduleEvent } from "@open-event-systems/schedule-lib"
import { parseConfig, type ScheduleConfigInput } from "./config.js"
import dayjs from "dayjs"
import type { TagConfigEntry } from "./types.js"

const timeZone = "America/New_York"

export const events = [
  {
    id: "opening-ceremonies",
    type: "Event",
    status: "EventScheduled",
    name: "Opening Ceremonies",
    description: "Join us as we kick off another year of our annual event.",
    startDate: dayjs(new Date(2025, 0, 17, 11)),
    endDate: dayjs(new Date(2025, 0, 17, 12)),
    location: ["Main Ballroom"],
    keywords: new Set(["main-event"]),
    performer: [{ type: "Organization", name: "Events Team" }],
  },
  {
    id: "photography-meetup",
    type: "Event",
    status: "EventScheduled",
    name: "Photography Meetup",
    description: "A meetup for amateur and professional photographers.",
    startDate: dayjs(new Date(2025, 0, 18, 12)),
    endDate: dayjs(new Date(2025, 0, 18, 13)),
    location: ["Panel Room 1"],
    keywords: new Set(["photography", "hobby"]),
    performer: [{ type: "Person", name: "Person", url: "https://example.net" }],
  },
  {
    id: "figure-drawing",
    type: "Event",
    status: "EventScheduled",
    name: "Figure Drawing",
    description: "A live figure drawing demonstration.",
    startDate: dayjs(new Date(2025, 0, 18, 14)),
    endDate: dayjs(new Date(2025, 0, 18, 16, 30)),
    location: ["Panel Room 2"],
    keywords: new Set(["art", "mature"]),
    performer: [
      { type: "Person", name: "Artist", url: "https://example.net" },
      { type: "Person", name: "Model", url: "https://example.net" },
    ],
  },
] as const satisfies readonly ScheduleEvent[]

export const parsedEvents = events

export const config = {
  id: "example-event",
  identifier: "example-event",
  name: "Example Event",
  dayChangeHour: 6,
  startDate: "2025-01-17T08:00:00-05:00",
  endDate: "2025-01-18T00:00:00-05:00",
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

export const tagConfigEntries = [
  { tag: "main-event", name: "Main Event" },
  { tag: "hobby", name: "Hobby" },
  { tag: "photography", name: "Photography" },
  { tag: "art", name: "Art" },
  { tag: "mature", name: "Mature" },
] as const satisfies TagConfigEntry[]

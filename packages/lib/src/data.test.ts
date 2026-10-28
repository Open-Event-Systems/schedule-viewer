import dayjs from "dayjs"
import durationPlugin from "dayjs/plugin/duration.js"
import { describe, expect, test } from "vitest"
import { indexScheduleData } from "./data.js"
import {
  ScheduleEventStatus,
  type ScheduleItemSeries,
  type ScheduleItemType,
} from "./types.js"

dayjs.extend(durationPlugin)

describe("data indexing", () => {
  test("indexing works", () => {
    const items: ScheduleItemSeries[] = [
      {
        item: {
          id: "e1",
          type: "event",
          name: "Example event",
          alternateNames: [],
          contacts: [],
          eventStatus: ScheduleEventStatus.scheduled,
          images: [],
          tags: new Set(),
          urls: [],
        },
        occurrences: [],
      },
      {
        item: {
          id: "v1",
          type: "vendor",
          name: "Example vendor",
          alternateNames: [],
          images: [],
          tags: new Set(),
          urls: [],
        },
        occurrences: [],
      },
      {
        item: {
          id: "a1",
          type: "amenity",
          name: "Example amenity",
          alternateNames: [],
          images: [],
          tags: new Set(),
          urls: [],
        },
        occurrences: [],
      },
    ]
    const index = indexScheduleData(items)
    const iterItems = [...index]

    expect(index.getById("e1")).toBe(items[0])
    expect(iterItems[0]).toBe(items[0])
    expect(index.getById("v1")).toBe(items[1])
    expect(index.getById("a1")).toBe(items[2])
    expect(index.getType("event").getById("e1")).toBe(items[0])
    expect(index.getType("event").count).toBe(1)
    expect(index.getType("vendor").getById("v1")).toBe(items[1])
    expect(index.getType("event").getById("a1")).toBeUndefined()
    expect(index.getType("bad" as ScheduleItemType).count).toBe(0)
  })
})

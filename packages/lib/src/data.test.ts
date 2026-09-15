import dayjs, { duration } from "dayjs"
import durationPlugin from "dayjs/plugin/duration.js"
import { describe, expect, test } from "vitest"
import { indexScheduleData, toOccurrenceArray } from "./data.js"
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
    expect(index.getType("event").size).toBe(1)
    expect(index.getType("vendor").getById("v1")).toBe(items[1])
    expect(index.getType("event").getById("a1")).toBeUndefined()
    expect(index.getType("bad" as ScheduleItemType).size).toBe(0)
  })

  test("toOccurrenceArray works", () => {
    const obj: ScheduleItemSeries = {
      item: {
        id: "e1",
        type: "event",
        alternateNames: [],
        contacts: [],
        eventStatus: ScheduleEventStatus.scheduled,
        images: [],
        tags: new Set(),
        urls: [],
      },
      occurrences: [
        {
          id: "e1-o1",
          eventStatus: ScheduleEventStatus.scheduled,
          startDate: dayjs("2027-01-01T12:00:00-05:00"),
          endDate: dayjs("2027-01-01T13:00:00-05:00"),
          duration: duration("PT1H"),
          locations: [],
        },
        {
          id: "e1-o2",
          eventStatus: ScheduleEventStatus.scheduled,
          startDate: dayjs("2027-01-01T14:00:00-05:00"),
          endDate: dayjs("2027-01-01T15:00:00-05:00"),
          duration: duration("PT1H"),
          locations: [],
        },
      ],
    }

    const occs = toOccurrenceArray(obj)
    expect(occs.length).toBe(2)
    expect(occs[0]?.id).toBe("e1-o1")
    expect(occs[0]?.item).toBe(obj.item)
    expect(occs[1]?.id).toBe("e1-o2")
    expect(occs[1]?.item).toBe(obj.item)
  })
})

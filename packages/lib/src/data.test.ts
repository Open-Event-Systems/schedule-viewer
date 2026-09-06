import { describe, expect, test } from "vitest"
import { defaultIndexConfig, indexData, toOccurrences } from "./data.js"
import type { ScheduleItem } from "./types.js"
import dayjs, { duration } from "dayjs"
import durationPlugin from "dayjs/plugin/duration.js"

dayjs.extend(durationPlugin)

describe("data indexing", () => {
  test("indexing works", () => {
    const items: ScheduleItem[] = [
      {
        id: "e1",
        type: "event",
        name: "Example event"
      },
      {
        id: "v1",
        type: "vendor",
        name: "Example vendor",
      },
      {
        id: "a1",
        type: "amenity",
        name: "Example amenity"
      },
      {
        id: "o1",
        type: "misc",
      } as ScheduleItem
    ]
    const index = indexData(defaultIndexConfig, items)

    expect(index.byId.get("e1")).toBe(items[0])
    expect(index.byId.get("v1")).toBe(items[1])
    expect(index.byId.get("a1")).toBe(items[2])
    expect(index.byType.events.byId.get("e1")).toBe(items[0])
    expect(index.byType.vendors.byId.get("v1")).toBe(items[1])
    expect(index.byType.events.byId.get("a1")).toBeUndefined()
    expect(index.other[0]).toBe(items[3])
  })

  test("toOccurrences works", () => {
    const obj: ScheduleItem = {
      id: "e1",
      type: "event",
      occurrences: [
        {
          id: "e1-o1",
          startDate: dayjs("2027-01-01T12:00:00-05:00"),
          endDate: dayjs("2027-01-01T13:00:00-05:00"),
          duration: duration("P1H"),
        },
        {
          id: "e1-o2",
          startDate: dayjs("2027-01-01T14:00:00-05:00"),
          endDate: dayjs("2027-01-01T15:00:00-05:00"),
          duration: duration("P1H"),
        },
      ]
    }

    const occs = toOccurrences(obj)
    expect(occs.length).toBe(2)
    expect(occs[0]?.id).toBe("e1-o1")
    expect(occs[0]?.item).toBe(obj)
    expect(occs[1]?.id).toBe("e1-o2")
    expect(occs[1]?.item).toBe(obj)
  })

  test("toOccurrences works (implicit occurrence)", () => {
    const obj: ScheduleItem = {
      id: "e1",
      type: "event",
      startDate: dayjs("2027-01-01T12:00:00-05:00"),
      endDate: dayjs("2027-01-01T13:00:00-05:00"),
      duration: duration("P1H"),
    }

    const occs = toOccurrences(obj)
    expect(occs.length).toBe(1)
    expect(occs[0]?.id).toBe("e1")
    expect(occs[0]?.item).toBe(obj)
  })
})

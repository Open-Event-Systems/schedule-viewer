import { toOccurrenceArray } from "#src/item.js"
import { ScheduleEventStatus, type ScheduleItemSeries } from "#src/types.js"
import dayjs, { duration } from "dayjs"
import { describe, expect, test } from "vitest"

describe("item funcs", () => {
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

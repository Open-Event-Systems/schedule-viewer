import { formatDuration } from "#src/date.js"
import { parseScheduleItem, parseScheduleItemSeries } from "#src/parse/json.js"
import { ScheduleEventStatus } from "#src/types.js"
import { describe, expect, test } from "vitest"

describe("json parsing", () => {
  test("schema parser works", () => {
    const input = {
      item: {
        id: "e1",
        type: "event",
        name: "Test event",
        description: undefined,
        tags: ["a", "b"],
      },
      occurrences: [
        {
          id: "occ1",
          startDate: "2027-01-16T12:00:00-05:00",
          endDate: "2027-01-16T13:00:00-05:00",
          duration: "PT1H",
        },
      ],
    }

    const res = parseScheduleItemSeries(parseScheduleItem, input)

    expect(res.success).toBe(true)
    if (res.success) {
      const item = res.data.item
      expect(item.type).toBe("event")
      expect(item.description).toBeUndefined()
      expect("description" in item).toBe(false)
      expect(item.tags).toBeInstanceOf(Set)
      expect(item.id).toBe("e1")

      if (item.type == "event") {
        expect(item.eventStatus).toBe(ScheduleEventStatus.scheduled)
      }

      const occ = res.data.occurrences[0]
      expect(occ).toBeDefined()
      if (occ) {
        expect(occ.eventStatus).toBe(ScheduleEventStatus.scheduled)
        expect(occ.duration).toBeDefined()
        if (occ.duration) {
          expect(formatDuration(occ.duration)).toBe("PT1H")
        }
      }
    }
  })
})

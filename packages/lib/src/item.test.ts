import { describe, expect, test } from "vitest"
import {
  parseItems,
  parseItemType,
  parseScheduleEvent,
  parseScheduleItem,
  parseVendor,
} from "./item.js"
import { ScheduleItemStore } from "./item-store.js"

describe("item parsing", () => {
  test("parses an item", () => {
    const data = {
      id: "e1",
      type: "event",
      title: "Event 1",
      start: "2020-01-01T00:00:00Z",
      end: "2020-01-01T00:00:00Z",
    }

    const itemRes = parseScheduleItem(data)
    expect(itemRes.success).toBe(true)
    if (itemRes.success) {
      const res = parseItemType(
        {
          event: parseScheduleEvent,
        },
        itemRes.value,
      )

      expect(res.success).toBe(true)
      if (res.success) {
        expect(res.value.type).toBe("event")
      }
    }
  })

  test("ignores invalid items", () => {
    const data = {
      id: "e1",
      type: "bad-event",
      title: "Event 1",
      start: "2020-01-01T00:00:00Z",
      end: "2020-01-01T00:00:00Z",
    }

    const itemRes = parseScheduleItem(data)
    expect(itemRes.success).toBe(true)
    if (itemRes.success) {
      const res = parseItemType(
        {
          event: parseScheduleEvent,
        },
        itemRes.value,
      )

      expect(res.success).toBe(false)
    }
  })

  test("parses items", () => {
    const data = [
      {
        id: "e1",
        type: "event",
      },
      {
        id: "v1",
        type: "vendor",
      },
      {
        id: "x1",
        type: "bad",
      },
      {
        id: "e2",
        type: "event",
      },
    ]

    const parsed = data
      .map((d) => parseScheduleItem(d))
      .filter((r) => r.success)
      .map((r) => r.value)
    expect(parsed.length).toBe(4)

    const asTypes = parseItems(
      {
        event: parseScheduleEvent,
        vendor: parseVendor,
      },
      parsed,
    )

    expect(Object.keys(asTypes)).toContain("event")
    expect(Object.keys(asTypes)).toContain("vendor")
    expect(Object.keys(asTypes).length).toBe(2)

    expect(asTypes.event).toBeInstanceOf(ScheduleItemStore)
    expect(asTypes.event.size).toBe(2)

    expect(asTypes.vendor.size).toBe(1)

    expect(asTypes.event.first?.id).toBe("e1")
    expect(asTypes.vendor.first?.id).toBe("v1")
  })
})

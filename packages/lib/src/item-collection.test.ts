import { describe, expect, test } from "vitest"
import { makeScheduleItemCollection } from "./item-collection.js"

describe("item-set", () => {
  test("constructor/iter", () => {
    const items = [
      { id: "1", type: "test" },
      { id: "2", type: "test" },
    ]
    const set = makeScheduleItemCollection(items)
    expect(set.size).toBe(2)

    const resItems = [...set]
    expect(resItems).toStrictEqual(items)
  })

  test("get", () => {
    const items = [
      { id: "1", type: "test" },
      { id: "2", type: "test" },
    ]
    const set = makeScheduleItemCollection(items)

    expect(set.get("2")).toStrictEqual(items[1])
    expect(set.get("3")).toBeUndefined()
  })

  test("filter", () => {
    const items = [
      { id: "1", type: "test" },
      { id: "2", type: "test" },
    ]
    const set = makeScheduleItemCollection(items)

    const filtered = makeScheduleItemCollection(
      set.filter(
        (f): f is { type: "test"; id: "2" } => f.type == "test" && f.id == "2",
      ),
    )

    expect(filtered.size).toBe(1)
    expect([...filtered][0]?.id).toBe("2")
  })
})

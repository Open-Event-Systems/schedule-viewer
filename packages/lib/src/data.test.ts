import { describe, expect, test } from "vitest"
import type { ScheduleItem } from "./types.js"
import { defaultIndexConfig, indexData } from "./data.js"

describe("data indexing", () => {
  test("indexing works", () => {
    const items: ScheduleItem[] = [
      {
        id: "e1",
        type: "ConferenceEvent",
        status: "EventScheduled",
        organizer: [
          "skip",
          {
            id: "p1",
            identifier: "p1-alt1",
            type: "Person",
            sameAs: ["p1-alt2"],
          },
        ],
      },
    ]
    const index = indexData(defaultIndexConfig, items)

    expect(index.byId.get("e1")?.id).toBe("e1")
    expect(index.byId.get("p1")?.id).toBe("p1")
    expect(index.byId.get("p1-alt1")?.id).toBe("p1")
    expect(index.byId.get("p1-alt2")?.id).toBe("p1")
    expect(index.byType.events.get("e1")?.id).toBe("e1")
    expect(index.byType.events.get("p1")?.id).toBeUndefined()
    expect(index.byType.people.get("p1-alt1")?.id).toBe("p1")
  })
})

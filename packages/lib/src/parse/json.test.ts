import { describe, expect, test } from "vitest"
import { defaultParserConfig, makeParser } from "./json.js"

describe("json parsing", () => {
  test("schema parser works", () => {
    const input = {
      id: "e1",
      type: "event",
      name: "Test event",
      description: " ",
      tags: ["a", "b"],
    }

    const parser = makeParser(defaultParserConfig)

    const res = parser(input)

    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.data.type).toBe("event")
      expect(res.data.description).toBeUndefined()
      expect(res.data.tags).toBeInstanceOf(Set)
      expect(res.data.id).toBe("e1")
    }
  })

  test("schema parser rejects unknown types", () => {
    const input = {
      id: "o1",
      type: "other",
    }

    const parser = makeParser(defaultParserConfig)

    const res = parser(input)

    expect(res.success).toBe(false)
  })
})

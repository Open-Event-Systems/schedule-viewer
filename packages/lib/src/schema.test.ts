import { describe, expect, test } from "vitest"
import { isoDate, optional, strSet } from "./schema.js"
import { isEqual } from "date-fns"
import z from "zod"

describe("schemas", () => {
  test("iso date", () => {
    const asStr = "2020-01-01T12:00:00.123"
    const date = isoDate.decode(asStr)

    const expected = new Date(2020, 0, 1, 12, 0, 0, 123)

    expect(isEqual(date, expected)).toBe(true)

    const newStr = isoDate.encode(date)
    expect(newStr).toEqual(asStr)
  })

  test("optional", () => {
    const s = optional(z.string())
    expect(s.decode("test")).toStrictEqual("test")
    expect(s.decode("")).toStrictEqual("")
    expect(s.decode(null)).toStrictEqual(undefined)
    expect(s.decode(undefined)).toStrictEqual(undefined)
    expect(s.encode("test")).toStrictEqual("test")
    expect(s.encode("")).toStrictEqual("")
    expect(s.encode(undefined)).toStrictEqual(undefined)
  })

  test("strSet", () => {
    expect(strSet.decode(["a", "b"])).toStrictEqual(new Set(["a", "b"]))
  })
})

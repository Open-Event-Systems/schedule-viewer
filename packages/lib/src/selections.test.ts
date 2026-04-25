import { describe, expect, test } from "vitest"
import {
  encodeLocalSessionSelections,
  makeSelections,
  parseLocalSessionSelections,
} from "./selections.js"
import { format, parseISO } from "date-fns"

describe("selections module", () => {
  test("construct/size", () => {
    const sel = makeSelections(["a", "b", "c"])

    expect([...sel].sort()).toStrictEqual(["a", "b", "c"])
    expect(sel.size).toBe(3)
  })

  test("has", () => {
    const sel = makeSelections(["a", "b"])

    expect(sel.has("a")).toBe(true)
    expect(sel.has("c")).toBe(false)
  })

  test("add", () => {
    const sel = makeSelections(["a"])
    const sel2 = sel.add("b")
    const sel3 = sel.add("b")

    expect([...sel2].sort()).toStrictEqual(["a", "b"])
    expect([...sel]).toStrictEqual(["a"])
    expect([...sel3].sort()).toStrictEqual(["a", "b"])
  })

  test("delete", () => {
    const sel = makeSelections(["a", "b"])
    const sel2 = sel.delete("a")
    const sel3 = sel2.delete("a")

    expect([...sel2].sort()).toStrictEqual(["b"])
    expect([...sel].sort()).toStrictEqual(["a", "b"])
    expect([...sel3].sort()).toStrictEqual(["b"])
  })

  test("equals", () => {
    const sel = makeSelections(["a", "b"])
    const sel2 = makeSelections(["b", "a"])
    const sel3 = makeSelections(["a", "c"])

    expect(sel.equals(sel2)).toBe(true)
    expect(sel2.equals(sel)).toBe(true)
    expect(sel.equals(sel3)).toBe(false)
    expect(sel3.equals(sel)).toBe(false)
  })

  test("parse local selections", () => {
    const data = {
      base: {
        date: format(
          parseISO("2020-01-01T12:00:00.001-05:00"),
          "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
        ),
        selections: {
          id: "testsels",
          items: ["a", "b", "c"],
        },
      },
      added: ["d"],
      deleted: ["c"],
      items: ["a", "b", "d"],
      date: format(
        parseISO("2020-01-01T13:00:00.001-05:00"),
        "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
      ),
    }

    const parsed = parseLocalSessionSelections(data)
    expect(parsed.equals(["d", "b", "a"])).toBe(true)
    expect(parsed.base?.equals(["a", "b", "c"])).toBe(true)
    expect(parsed.date).toEqual(parseISO("2020-01-01T13:00:00.001-05:00"))

    const unparsed = encodeLocalSessionSelections(parsed)
    expect(unparsed).toStrictEqual(data)
    const reparsed = parseLocalSessionSelections(
      JSON.parse(JSON.stringify(unparsed)),
    )
    expect(reparsed.equals(parsed)).toBe(true)
  })
})

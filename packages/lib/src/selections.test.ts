import { describe, expect, test } from "vitest"
import {
  isTrackedSelections,
  makeSelections,
  parseSelections,
  unparseSelections,
} from "./selections.js"

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

  test("parse tracked selections", () => {
    const data = {
      base: {
        id: "testsels",
        items: ["a", "b", "c"],
      },
      added: ["d"],
      deleted: ["c"],
      items: ["a", "b", "d"],
    }

    const parsed = parseSelections(data)
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.equals(["d", "b", "a"])).toBe(true)
      expect(isTrackedSelections(parsed.data)).toBe(true)
      if (isTrackedSelections(parsed.data)) {
        expect(parsed.data.base.equals(["a", "b", "c"])).toBe(true)
      }

      const unparsed = unparseSelections(parsed.data)
      expect(unparsed).toStrictEqual(data)
      const reparsed = parseSelections(JSON.parse(JSON.stringify(unparsed)))
      expect(reparsed.success).toBe(true)
      if (reparsed.success) {
        expect(reparsed.data.equals(parsed.data)).toBe(true)
      }
    }
  })
})

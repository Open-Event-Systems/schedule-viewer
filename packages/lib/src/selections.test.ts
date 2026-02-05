import { describe, expect, test } from "vitest"
import {
  chooseNewer,
  makeSelections,
  makeSessionSelections,
} from "./selections.js"
import { parseISO } from "date-fns"

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

  test("make with ID", () => {
    const sel = makeSelections(["a", "b"], "1")
    expect("id" in sel).toBe(true)
    expect(sel.id).toBe("1")
  })

  test("equal with ID", () => {
    const sel = makeSelections(["a", "b"], "1")
    const sel2 = makeSelections(["b", "a"], "1")
    const sel3 = makeSelections(["b", "a"], "2")
    expect(sel.equals(sel2)).toBe(true)
    expect(sel.equals(sel3)).toBe(false)
  })

  test("chooseNewer", () => {
    const a = makeSessionSelections(["a"], parseISO("2020-01-01T00:00:00Z"))
    const b = makeSessionSelections(["b"], parseISO("2020-01-01T00:00:01Z"))

    expect(chooseNewer(a, b)).toEqual(b)
  })

  test("chooseNewer equal", () => {
    const a = makeSessionSelections(["a"], parseISO("2020-01-01T00:00:00Z"))
    const b = makeSessionSelections(["b"], parseISO("2020-01-01T00:00:00Z"))

    expect(chooseNewer(a, b)).toEqual(a)
  })

  test("chooseNewer undefined date", () => {
    const a = makeSessionSelections(["a"])
    const b = makeSessionSelections(["b"], parseISO("2020-01-01T00:00:00Z"))

    expect(chooseNewer(a, b)).toEqual(b)
  })

  test("chooseNewer both undefined date", () => {
    const a = makeSessionSelections(["a"])
    const b = makeSessionSelections(["b"])

    expect(chooseNewer(a, b)).toEqual(a)
  })
})

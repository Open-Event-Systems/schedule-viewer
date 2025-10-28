import { describe, test, expect } from "vitest"
import { parseISO } from "date-fns"
import { chooseNewer, makeSelections } from "./selections.js"

describe("selections module", () => {
  test("chooseNewer", () => {
    const a = makeSelections(["a"], parseISO("2020-01-01T00:00:00Z"))
    const b = makeSelections(["b"], parseISO("2020-01-01T00:00:01Z"))

    expect(chooseNewer(a, b)).toEqual(b)
  })

  test("chooseNewer equal", () => {
    const a = makeSelections(["a"], parseISO("2020-01-01T00:00:00Z"))
    const b = makeSelections(["b"], parseISO("2020-01-01T00:00:00Z"))

    expect(chooseNewer(a, b)).toEqual(a)
  })

  test("chooseNewer undefined date", () => {
    const a = makeSelections(["a"])
    const b = makeSelections(["b"], parseISO("2020-01-01T00:00:00Z"))

    expect(chooseNewer(a, b)).toEqual(b)
  })

  test("chooseNewer both undefined date", () => {
    const a = makeSelections(["a"])
    const b = makeSelections(["b"])

    expect(chooseNewer(a, b)).toEqual(a)
  })
})

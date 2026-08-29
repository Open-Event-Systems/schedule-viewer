import { describe, expect, test } from "vitest"
import { formatDuration, formatISO, parseDuration, parseISO } from "./date.js"
import dayjs from "dayjs"

describe("date parsing/formatting", () => {
  test("parses ISO date", () => {
    const isoStr = "2020-01-01T12:00:00.123-06:00"
    const result = parseISO(isoStr)
    expect(result.valueOf()).toBe(1577901600123)
    expect(result.utcOffset()).toBe(-360)
    expect(result.hour()).toBe(12)
  })

  test("formats ISO date", () => {
    const date = parseISO("2020-01-01T12:00:00.123-06:00")
    const result = formatISO(date)
    expect(result).toBe("2020-01-01T12:00:00.123-06:00")
  })

  test("formats ISO date, no ms", () => {
    const date = parseISO("2020-01-01T12:00:00-06:00")
    const result = formatISO(date)
    expect(result).toBe("2020-01-01T12:00:00-06:00")
  })

  test("parses durations", () => {
    const d = parseDuration("PT1H30M")
    expect(d.asSeconds()).toBe(5400)
  })

  test("formats durations", () => {
    const d = dayjs.duration(100, "minutes")
    expect(formatDuration(d)).toBe("PT1H40M")
  })
})

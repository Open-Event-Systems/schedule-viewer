import { formatISO, parseISO } from "date-fns"
import {
  contains,
  getDay,
  intersects,
  intervalToTimezone,
  sortIntervalsByStartDate,
  toTimezone,
} from "./time.js"

describe("time module", () => {
  test.each([
    {
      start: "2020-01-01T00:00:00Z",
      end: "2020-01-01T01:00:00Z",
      date: "2020-01-01T00:00:00Z",
      expected: true,
    },
    {
      start: "2020-01-01T00:00:00Z",
      end: "2020-01-01T01:00:00Z",
      date: "2020-01-01T01:00:00Z",
      expected: false,
    },
    {
      start: "2020-01-01T00:00:00Z",
      end: "2020-01-01T01:00:00Z",
      date: "2020-01-01T00:30:00Z",
      expected: true,
    },
    {
      start: "2020-01-01T00:00:00Z",
      end: "2020-01-01T01:00:00Z",
      date: "2020-01-01T01:30:00Z",
      expected: false,
    },
    {
      start: "2020-01-01T01:00:00Z",
      end: "2020-01-01T02:00:00Z",
      date: "2020-01-01T00:00:00Z",
      expected: false,
    },
    {
      start: "2020-01-01T01:00:00Z",
      date: "2020-01-02T01:00:00Z",
      expected: true,
    },
    {
      start: "2020-01-01T01:00:00Z",
      date: "2020-01-01T00:00:00Z",
      expected: false,
    },
    {
      end: "2020-01-01T01:00:00Z",
      date: "2000-01-01T01:00:00Z",
      expected: true,
    },
    {
      end: "2020-01-01T01:00:00Z",
      date: "2020-01-01T01:00:00Z",
      expected: false,
    },
  ])(
    "$start-$end contains $date ($expected)",
    ({ start, end, date, expected }) => {
      const interval = {
        start: start ? parseISO(start) : undefined,
        end: end ? parseISO(end) : undefined,
      }

      const dateObj = parseISO(date)

      expect(contains(interval, dateObj)).toBe(expected)
    },
  )

  test("includeEndpoint works", () => {
    const interval = {
      start: parseISO("2020-01-01T00:00:00Z"),
      end: parseISO("2020-01-01T01:00:00Z"),
    }

    const dateObj = parseISO("2020-01-01T01:00:00Z")

    expect(contains(interval, dateObj, true)).toBe(true)
  })

  test.each([
    {
      a: { start: "2020-01-01T00:00:00Z", end: "2020-01-01T01:00:00Z" },
      b: { start: "2020-01-01T00:30:00Z", end: "2020-01-01T01:30:00Z" },
      expected: true,
    },
    {
      b: { start: "2020-01-01T00:00:00Z", end: "2020-01-01T01:00:00Z" },
      a: { start: "2020-01-01T00:30:00Z", end: "2020-01-01T01:30:00Z" },
      expected: true,
    },
    {
      a: { start: "2020-01-01T00:00:00Z", end: "2020-01-01T01:00:00Z" },
      b: { start: "2020-01-01T01:00:00Z", end: "2020-01-01T02:00:00Z" },
      expected: false,
    },
    {
      b: { start: "2020-01-01T00:00:00Z", end: "2020-01-01T01:00:00Z" },
      a: { start: "2020-01-01T01:00:00Z", end: "2020-01-01T02:00:00Z" },
      expected: false,
    },
    {
      a: { start: "2020-01-01T00:00:00Z", end: "2020-01-01T01:00:00Z" },
      b: { start: "2020-01-01T00:00:00Z", end: "2020-01-01T01:00:00Z" },
      expected: true,
    },
    {
      a: { start: "2020-01-01T00:00:00Z", end: "2020-01-01T04:00:00Z" },
      b: { start: "2020-01-01T01:00:00Z", end: "2020-01-01T02:00:00Z" },
      expected: true,
    },
    {
      b: { start: "2020-01-01T00:00:00Z", end: "2020-01-01T04:00:00Z" },
      a: { start: "2020-01-01T01:00:00Z", end: "2020-01-01T02:00:00Z" },
      expected: true,
    },
    {
      a: { start: "2020-01-01T01:00:00Z", end: "2020-01-01T02:00:00Z" },
      b: { start: "2020-01-01T01:30:00Z" },
      expected: true,
    },
    {
      a: { start: "2020-01-01T01:00:00Z", end: "2020-01-01T02:00:00Z" },
      b: { start: "2020-01-01T02:00:00Z" },
      expected: false,
    },
    {
      a: { start: "2020-01-01T00:00:00Z" },
      b: { start: "2020-01-01T01:00:00Z", end: "2020-01-01T02:00:00Z" },
      expected: true,
    },
    {
      a: { start: "2020-01-01T03:00:00Z" },
      b: { start: "2020-01-01T01:00:00Z", end: "2020-01-01T02:00:00Z" },
      expected: false,
    },
    {
      a: { end: "2020-01-01T01:00:00Z" },
      b: { start: "2020-01-01T00:00:00Z", end: "2020-01-01T02:00:00Z" },
      expected: true,
    },
    {
      a: { end: "2020-01-01T01:00:00Z" },
      b: { start: "2020-01-01T00:00:00Z", end: "2020-01-01T01:00:00Z" },
      expected: true,
    },
    {
      a: { end: "2020-01-01T01:00:00Z" },
      b: { start: "2020-01-01T01:00:00Z", end: "2020-01-01T02:00:00Z" },
      expected: false,
    },
    {
      a: { start: "2020-01-01T01:00:00Z" },
      b: { end: "2020-01-01T02:00:00Z" },
      expected: true,
    },
    {
      a: { start: "2020-01-01T01:00:00Z" },
      b: { end: "2020-01-01T01:00:00Z" },
      expected: false,
    },
    {
      a: {},
      b: {},
      expected: true,
    },
    {
      a: {},
      b: { start: "2020-01-01T01:00:00Z", end: "2020-01-01T02:00:00Z" },
      expected: true,
    },
  ])(
    "$a.start-$a.end and $b.start-$b.end intersect ($expected)",
    ({ a, b, expected }) => {
      const aInt = {
        start: a.start ? parseISO(a.start) : undefined,
        end: a.end ? parseISO(a.end) : undefined,
      }

      const bInt = {
        start: b.start ? parseISO(b.start) : undefined,
        end: b.end ? parseISO(b.end) : undefined,
      }

      expect(intersects(aInt, bInt)).toBe(expected)
    },
  )

  test("toTimezone works", () => {
    const dt = parseISO("2020-01-01T00:00:00Z")
    const dTz = toTimezone(dt, "America/New_York")
    const dTz2 = toTimezone(dt, "America/Chicago")
    const format = formatISO(dTz)
    const format2 = formatISO(dTz2)

    expect(format).toEqual("2019-12-31T19:00:00-05:00")
    expect(format2).toEqual("2019-12-31T18:00:00-06:00")
  })

  test("intervalToTimezone works", () => {
    const int = {
      start: parseISO("2020-01-01T00:00:00Z"),
    }

    const intTz = intervalToTimezone(int, "America/Chicago")
    const format = intTz.start ? formatISO(intTz.start) : undefined
    expect(format).toEqual("2019-12-31T18:00:00-06:00")
    expect(intTz.end).toBeUndefined()
  })

  test("sortByDate", () => {
    const intervals = [
      {},
      {
        start: parseISO("2020-01-01T01:00:00Z"),
        end: parseISO("2020-01-01T01:30:00Z"),
      },
      {
        start: parseISO("2020-01-01T00:00:00Z"),
        end: parseISO("2020-01-01T01:00:00Z"),
      },
      {
        start: parseISO("2020-01-01T00:30:00Z"),
        end: parseISO("2020-01-01T01:00:00Z"),
      },
    ]

    const expected = [
      {},
      {
        start: parseISO("2020-01-01T00:00:00Z"),
        end: parseISO("2020-01-01T01:00:00Z"),
      },
      {
        start: parseISO("2020-01-01T00:30:00Z"),
        end: parseISO("2020-01-01T01:00:00Z"),
      },
      {
        start: parseISO("2020-01-01T01:00:00Z"),
        end: parseISO("2020-01-01T01:30:00Z"),
      },
    ]

    sortIntervalsByStartDate(intervals)

    expect(intervals).toEqual(expected)
  })

  test("getDay", () => {
    const dt = parseISO("2020-01-01T03:00:00-05:00")

    expect(getDay(dt, "America/New_York", 0)).toEqual({
      start: parseISO("2020-01-01T00:00:00-05:00"),
      end: parseISO("2020-01-02T00:00:00-05:00"),
    })

    expect(getDay(dt, "America/New_York", 6)).toEqual({
      start: parseISO("2019-12-31T06:00:00-05:00"),
      end: parseISO("2020-01-01T06:00:00-05:00"),
    })

    expect(getDay(dt, "America/New_York", 3)).toEqual({
      start: parseISO("2020-01-01T03:00:00-05:00"),
      end: parseISO("2020-01-02T03:00:00-05:00"),
    })
  })
})

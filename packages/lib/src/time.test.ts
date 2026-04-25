import { describe, test, expect } from "vitest"
import { parseISO } from "date-fns"
import {
  contains,
  getDay,
  getDays,
  intersects,
  sortIntervalsByStartDate,
} from "./time.js"

describe("time module", () => {
  test.each([
    {
      start: "2020-01-01T00:00:00",
      end: "2020-01-01T01:00:00",
      date: "2020-01-01T00:00:00",
      expected: true,
    },
    {
      start: "2020-01-01T00:00:00",
      end: "2020-01-01T01:00:00",
      date: "2020-01-01T01:00:00",
      expected: false,
    },
    {
      start: "2020-01-01T00:00:00",
      end: "2020-01-01T01:00:00",
      date: "2020-01-01T00:30:00",
      expected: true,
    },
    {
      start: "2020-01-01T00:00:00",
      end: "2020-01-01T01:00:00",
      date: "2020-01-01T01:30:00",
      expected: false,
    },
    {
      start: "2020-01-01T01:00:00",
      end: "2020-01-01T02:00:00",
      date: "2020-01-01T00:00:00",
      expected: false,
    },
    {
      start: "2020-01-01T01:00:00",
      date: "2020-01-02T01:00:00",
      expected: true,
    },
    {
      start: "2020-01-01T01:00:00",
      date: "2020-01-01T00:00:00",
      expected: false,
    },
    {
      end: "2020-01-01T01:00:00",
      date: "2000-01-01T01:00:00",
      expected: true,
    },
    {
      end: "2020-01-01T01:00:00",
      date: "2020-01-01T01:00:00",
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
      start: parseISO("2020-01-01T00:00:00"),
      end: parseISO("2020-01-01T01:00:00"),
    }

    const dateObj = parseISO("2020-01-01T01:00:00")

    expect(contains(interval, dateObj, true)).toBe(true)
  })

  test.each([
    {
      a: { start: "2020-01-01T00:00:00", end: "2020-01-01T01:00:00" },
      b: { start: "2020-01-01T00:30:00", end: "2020-01-01T01:30:00" },
      expected: true,
    },
    {
      b: { start: "2020-01-01T00:00:00", end: "2020-01-01T01:00:00" },
      a: { start: "2020-01-01T00:30:00", end: "2020-01-01T01:30:00" },
      expected: true,
    },
    {
      a: { start: "2020-01-01T00:00:00", end: "2020-01-01T01:00:00" },
      b: { start: "2020-01-01T01:00:00", end: "2020-01-01T02:00:00" },
      expected: false,
    },
    {
      b: { start: "2020-01-01T00:00:00", end: "2020-01-01T01:00:00" },
      a: { start: "2020-01-01T01:00:00", end: "2020-01-01T02:00:00" },
      expected: false,
    },
    {
      a: { start: "2020-01-01T00:00:00", end: "2020-01-01T01:00:00" },
      b: { start: "2020-01-01T00:00:00", end: "2020-01-01T01:00:00" },
      expected: true,
    },
    {
      a: { start: "2020-01-01T00:00:00", end: "2020-01-01T04:00:00" },
      b: { start: "2020-01-01T01:00:00", end: "2020-01-01T02:00:00" },
      expected: true,
    },
    {
      b: { start: "2020-01-01T00:00:00", end: "2020-01-01T04:00:00" },
      a: { start: "2020-01-01T01:00:00", end: "2020-01-01T02:00:00" },
      expected: true,
    },
    {
      a: { start: "2020-01-01T01:00:00", end: "2020-01-01T02:00:00" },
      b: { start: "2020-01-01T01:30:00" },
      expected: true,
    },
    {
      a: { start: "2020-01-01T01:00:00", end: "2020-01-01T02:00:00" },
      b: { start: "2020-01-01T02:00:00" },
      expected: false,
    },
    {
      a: { start: "2020-01-01T00:00:00" },
      b: { start: "2020-01-01T01:00:00", end: "2020-01-01T02:00:00" },
      expected: true,
    },
    {
      a: { start: "2020-01-01T03:00:00" },
      b: { start: "2020-01-01T01:00:00", end: "2020-01-01T02:00:00" },
      expected: false,
    },
    {
      a: { end: "2020-01-01T01:00:00" },
      b: { start: "2020-01-01T00:00:00", end: "2020-01-01T02:00:00" },
      expected: true,
    },
    {
      a: { end: "2020-01-01T01:00:00" },
      b: { start: "2020-01-01T00:00:00", end: "2020-01-01T01:00:00" },
      expected: true,
    },
    {
      a: { end: "2020-01-01T01:00:00" },
      b: { start: "2020-01-01T01:00:00", end: "2020-01-01T02:00:00" },
      expected: false,
    },
    {
      a: { start: "2020-01-01T01:00:00" },
      b: { end: "2020-01-01T02:00:00" },
      expected: true,
    },
    {
      a: { start: "2020-01-01T01:00:00" },
      b: { end: "2020-01-01T01:00:00" },
      expected: false,
    },
    {
      a: {},
      b: {},
      expected: true,
    },
    {
      a: {},
      b: { start: "2020-01-01T01:00:00", end: "2020-01-01T02:00:00" },
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

  test("sortByDate", () => {
    const intervals = [
      {},
      {
        start: parseISO("2020-01-01T01:00:00"),
        end: parseISO("2020-01-01T01:30:00"),
      },
      {
        start: parseISO("2020-01-01T00:00:00"),
        end: parseISO("2020-01-01T01:00:00"),
      },
      {
        start: parseISO("2020-01-01T00:30:00"),
        end: parseISO("2020-01-01T01:00:00"),
      },
    ]

    const expected = [
      {},
      {
        start: parseISO("2020-01-01T00:00:00"),
        end: parseISO("2020-01-01T01:00:00"),
      },
      {
        start: parseISO("2020-01-01T00:30:00"),
        end: parseISO("2020-01-01T01:00:00"),
      },
      {
        start: parseISO("2020-01-01T01:00:00"),
        end: parseISO("2020-01-01T01:30:00"),
      },
    ]

    sortIntervalsByStartDate(intervals)

    expect(intervals).toEqual(expected)
  })

  test("getDay", () => {
    const dt = parseISO("2020-01-01T03:00:00")

    expect(getDay(dt, 0)).toEqual({
      key: "2020-01-01",
      start: parseISO("2020-01-01T00:00:00"),
      end: parseISO("2020-01-02T00:00:00"),
    })

    expect(getDay(dt, 6)).toEqual({
      key: "2019-12-31",
      start: parseISO("2019-12-31T06:00:00"),
      end: parseISO("2020-01-01T06:00:00"),
    })

    expect(getDay(dt, 3)).toEqual({
      key: "2020-01-01",
      start: parseISO("2020-01-01T03:00:00"),
      end: parseISO("2020-01-02T03:00:00"),
    })
  })

  test("getDays", () => {
    expect(
      getDays(
        [
          {
            start: parseISO("2020-01-01T12:00:00"),
          },
          {
            start: parseISO("2020-01-01T15:00:00"),
          },
        ],
        3,
      ),
    ).toEqual([
      {
        key: "2020-01-01",
        start: parseISO("2020-01-01T03:00:00"),
        end: parseISO("2020-01-02T03:00:00"),
      },
    ])

    expect(
      getDays(
        [
          {
            start: parseISO("2020-01-01T03:00:00"),
          },
          {
            start: parseISO("2020-01-02T03:00:00"),
          },
          {
            start: parseISO("2020-01-03T02:00:00"),
          },
        ],
        3,
      ),
    ).toEqual([
      {
        key: "2020-01-01",
        start: parseISO("2020-01-01T03:00:00"),
        end: parseISO("2020-01-02T03:00:00"),
      },
      {
        key: "2020-01-02",
        start: parseISO("2020-01-02T03:00:00"),
        end: parseISO("2020-01-03T03:00:00"),
      },
    ])

    expect(
      getDays(
        [
          {
            start: parseISO("2020-01-01T12:00:00"),
          },
          {
            start: parseISO("2020-01-01T15:00:00"),
          },
          {
            start: parseISO("2020-01-03T12:00:00"),
          },
        ],
        3,
      ),
    ).toEqual([
      {
        key: "2020-01-01",
        start: parseISO("2020-01-01T03:00:00"),
        end: parseISO("2020-01-02T03:00:00"),
      },
      {
        key: "2020-01-03",
        start: parseISO("2020-01-03T03:00:00"),
        end: parseISO("2020-01-04T03:00:00"),
      },
    ])
  })
})

import { describe, test, expect } from "vitest"
import {
  contains,
  getDay,
  getDays,
  intersects,
  sortIntervalsByStartDate,
} from "./time.js"
import { parseISO } from "./date.js"

describe("time module", () => {
  test.each([
    {
      startDate: "2020-01-01T00:00:00",
      endDate: "2020-01-01T01:00:00",
      date: "2020-01-01T00:00:00",
      expected: true,
    },
    {
      startDate: "2020-01-01T00:00:00",
      endDate: "2020-01-01T01:00:00",
      date: "2020-01-01T01:00:00",
      expected: false,
    },
    {
      startDate: "2020-01-01T00:00:00",
      endDate: "2020-01-01T01:00:00",
      date: "2020-01-01T00:30:00",
      expected: true,
    },
    {
      startDate: "2020-01-01T00:00:00",
      endDate: "2020-01-01T01:00:00",
      date: "2020-01-01T01:30:00",
      expected: false,
    },
    {
      startDate: "2020-01-01T01:00:00",
      endDate: "2020-01-01T02:00:00",
      date: "2020-01-01T00:00:00",
      expected: false,
    },
    {
      startDate: "2020-01-01T01:00:00",
      date: "2020-01-02T01:00:00",
      expected: true,
    },
    {
      startDate: "2020-01-01T01:00:00",
      date: "2020-01-01T00:00:00",
      expected: false,
    },
    {
      endDate: "2020-01-01T01:00:00",
      date: "2000-01-01T01:00:00",
      expected: true,
    },
    {
      endDate: "2020-01-01T01:00:00",
      date: "2020-01-01T01:00:00",
      expected: false,
    },
  ])(
    "$start-$end contains $date ($expected)",
    ({ startDate, endDate, date, expected }) => {
      const interval = {
        startDate: startDate ? parseISO(startDate) : undefined,
        endDate: endDate ? parseISO(endDate) : undefined,
      }

      const dateObj = parseISO(date)

      expect(contains(interval, dateObj)).toBe(expected)
    },
  )

  test("includeEndpoint works", () => {
    const interval = {
      startDate: parseISO("2020-01-01T00:00:00"),
      endDate: parseISO("2020-01-01T01:00:00"),
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
        startDate: a.start ? parseISO(a.start) : undefined,
        endDate: a.end ? parseISO(a.end) : undefined,
      }

      const bInt = {
        startDate: b.start ? parseISO(b.start) : undefined,
        endDate: b.end ? parseISO(b.end) : undefined,
      }

      expect(intersects(aInt, bInt)).toBe(expected)
    },
  )

  test("sortByDate", () => {
    const intervals = [
      {},
      {
        startDate: parseISO("2020-01-01T01:00:00"),
        endDate: parseISO("2020-01-01T01:30:00"),
      },
      {
        startDate: parseISO("2020-01-01T00:00:00"),
        endDate: parseISO("2020-01-01T01:00:00"),
      },
      {
        startDate: parseISO("2020-01-01T00:30:00"),
        endDate: parseISO("2020-01-01T01:00:00"),
      },
    ]

    const expected = [
      {},
      {
        startDate: parseISO("2020-01-01T00:00:00"),
        endDate: parseISO("2020-01-01T01:00:00"),
      },
      {
        startDate: parseISO("2020-01-01T00:30:00"),
        endDate: parseISO("2020-01-01T01:00:00"),
      },
      {
        startDate: parseISO("2020-01-01T01:00:00"),
        endDate: parseISO("2020-01-01T01:30:00"),
      },
    ]

    sortIntervalsByStartDate(intervals)

    expect(intervals).toEqual(expected)
  })

  test("getDay", () => {
    const dt = parseISO("2020-01-01T03:00:00")

    expect(getDay(dt, 0)).toEqual({
      key: "2020-01-01",
      startDate: parseISO("2020-01-01T00:00:00"),
      endDate: parseISO("2020-01-02T00:00:00"),
    })

    expect(getDay(dt, 6)).toEqual({
      key: "2019-12-31",
      startDate: parseISO("2019-12-31T06:00:00"),
      endDate: parseISO("2020-01-01T06:00:00"),
    })

    expect(getDay(dt, 3)).toEqual({
      key: "2020-01-01",
      startDate: parseISO("2020-01-01T03:00:00"),
      endDate: parseISO("2020-01-02T03:00:00"),
    })
  })

  test("getDays", () => {
    expect(
      getDays(
        [
          {
            startDate: parseISO("2020-01-01T12:00:00"),
          },
          {
            startDate: parseISO("2020-01-01T15:00:00"),
          },
        ],
        3,
      ),
    ).toEqual([
      {
        key: "2020-01-01",
        startDate: parseISO("2020-01-01T03:00:00"),
        endDate: parseISO("2020-01-02T03:00:00"),
      },
    ])

    expect(
      getDays(
        [
          {
            startDate: parseISO("2020-01-01T03:00:00"),
          },
          {
            startDate: parseISO("2020-01-02T03:00:00"),
          },
          {
            startDate: parseISO("2020-01-03T02:00:00"),
          },
        ],
        3,
      ),
    ).toEqual([
      {
        key: "2020-01-01",
        startDate: parseISO("2020-01-01T03:00:00"),
        endDate: parseISO("2020-01-02T03:00:00"),
      },
      {
        key: "2020-01-02",
        startDate: parseISO("2020-01-02T03:00:00"),
        endDate: parseISO("2020-01-03T03:00:00"),
      },
    ])

    expect(
      getDays(
        [
          {
            startDate: parseISO("2020-01-01T12:00:00"),
          },
          {
            startDate: parseISO("2020-01-01T15:00:00"),
          },
          {
            startDate: parseISO("2020-01-03T12:00:00"),
          },
        ],
        3,
      ),
    ).toEqual([
      {
        key: "2020-01-01",
        startDate: parseISO("2020-01-01T03:00:00"),
        endDate: parseISO("2020-01-02T03:00:00"),
      },
      {
        key: "2020-01-03",
        startDate: parseISO("2020-01-03T03:00:00"),
        endDate: parseISO("2020-01-04T03:00:00"),
      },
    ])
  })
})

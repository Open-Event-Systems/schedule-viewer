import { describe, expect, test } from "vitest"
import {
  binByTitle,
  makeDayBinFunc,
  makeTagBinFunc,
  makeTimeBinFunc,
} from "./bins.js"
import { isEqual, parseISO } from "date-fns"
import { toTimezone } from "./time.js"

describe("bin by title", () => {
  test("basic sorting", () => {
    const items = [
      {
        title: "B",
      },
      {
        title: "AB",
      },
      {
        title: "aa",
      },
    ]

    expect([...binByTitle(items)]).toStrictEqual([
      {
        key: "A",
        title: "A",
        items: [
          {
            title: "aa",
          },
          {
            title: "AB",
          },
        ],
      },
      {
        key: "B",
        title: "B",
        items: [
          {
            title: "B",
          },
        ],
      },
    ])
  })

  test("special character handling", () => {
    const items = [
      {
        title: "!A",
      },
      {
        title: "(1)",
      },
    ]

    expect([...binByTitle(items)]).toStrictEqual([
      {
        key: "#",
        title: "#",
        items: [
          {
            title: "(1)",
          },
        ],
      },
      {
        key: "A",
        title: "A",
        items: [
          {
            title: "!A",
          },
        ],
      },
    ])
  })

  test("handles missing title", () => {
    const items = [{}, { title: "" }]

    expect([...binByTitle(items)]).toStrictEqual([
      {
        key: "Other",
        title: "Other",
        items: [{}, { title: "" }],
      },
    ])
  })
})

describe("bin by tag", () => {
  const tagEntries = [
    { tag: "a", title: "Tag A" },
    { tag: "b", title: "Tag B" },
  ]

  test("sort and bins by tags", () => {
    const items = [
      {
        tags: ["a"],
      },
      {
        tags: ["b"],
      },
      {
        tags: ["a"],
      },
    ]

    const func = makeTagBinFunc(tagEntries)

    expect([...func(items)]).toStrictEqual([
      {
        key: "tag-a",
        title: "Tag A",
        items: [{ tags: ["a"] }, { tags: ["a"] }],
      },
      {
        key: "tag-b",
        title: "Tag B",
        items: [{ tags: ["b"] }],
      },
    ])
  })

  test("include once per tag", () => {
    const items = [
      {
        tags: ["a", "b"],
      },
    ]

    const func = makeTagBinFunc(tagEntries)

    expect([...func(items)]).toStrictEqual([
      {
        key: "tag-a",
        title: "Tag A",
        items: [{ tags: ["a", "b"] }],
      },
      {
        key: "tag-b",
        title: "Tag B",
        items: [{ tags: ["a", "b"] }],
      },
    ])
  })

  test("omit missing tags", () => {
    const items = [
      {
        tags: ["a", "c"],
      },
    ]

    const func = makeTagBinFunc(tagEntries)

    expect([...func(items)]).toStrictEqual([
      {
        key: "tag-a",
        title: "Tag A",
        items: [{ tags: ["a", "c"] }],
      },
    ])
  })

  test("add n/a tag", () => {
    const items = [
      {
        tags: ["c"],
      },
    ]

    const func = makeTagBinFunc(tagEntries)

    expect([...func(items)]).toStrictEqual([
      {
        key: "na",
        title: "N/A",
        items: [{ tags: ["c"] }],
      },
    ])
  })
})

describe("bin by time", () => {
  const now = toTimezone(
    parseISO("2020-01-01T12:00:00-05:00"),
    "America/New_York",
  )

  test("bins by time", () => {
    const items = [
      {
        start: toTimezone(
          parseISO("2020-01-01T13:01:00-05:00"),
          "America/New_York",
        ),
        end: toTimezone(
          parseISO("2020-01-01T14:00:00-05:00"),
          "America/New_York",
        ),
      },
      {
        start: toTimezone(
          parseISO("2020-01-01T13:04:59-05:00"),
          "America/New_York",
        ),
        end: toTimezone(
          parseISO("2020-01-01T14:00:00-05:00"),
          "America/New_York",
        ),
      },
      {
        start: toTimezone(
          parseISO("2020-01-01T13:30:00-05:00"),
          "America/New_York",
        ),
        end: toTimezone(
          parseISO("2020-01-01T14:00:00-05:00"),
          "America/New_York",
        ),
      },
    ]

    const func = makeTimeBinFunc(now)
    const binned = [...func(items)]
    expect(binned.length).toBe(2)
    expect(binned[0]?.key).toBe("202001011300")
    expect(binned[0]?.title).toBe("1:00 pm")
    expect(
      isEqual(
        [...(binned[0]?.items ?? [])][0]?.start ?? new Date(),
        toTimezone(parseISO("2020-01-01T13:01:00-05:00"), "America/New_York"),
      ),
    ).toBe(true)
    expect([...(binned[0]?.items ?? [])].length).toBe(2)
    expect(binned[1]?.key).toBe("202001011330")
    expect(binned[1]?.title).toBe("1:30 pm")
    expect([...(binned[1]?.items ?? [])].length).toBe(1)
  })

  test("includes now bin", () => {
    const items = [
      {
        start: toTimezone(
          parseISO("2020-01-01T09:00:00-05:00"),
          "America/New_York",
        ),
        end: toTimezone(
          parseISO("2020-01-01T10:00:00-05:00"),
          "America/New_York",
        ),
      },
      {
        start: toTimezone(
          parseISO("2020-01-01T11:00:00-05:00"),
          "America/New_York",
        ),
        end: toTimezone(
          parseISO("2020-01-01T12:01:00-05:00"),
          "America/New_York",
        ),
      },
      {
        start: toTimezone(
          parseISO("2020-01-01T13:00:00-05:00"),
          "America/New_York",
        ),
        end: toTimezone(
          parseISO("2020-01-01T13:30:00-05:00"),
          "America/New_York",
        ),
      },
    ]

    const func = makeTimeBinFunc(now)
    const binned = [...func(items)]
    expect(binned.length).toBe(3)
    expect(binned[0]?.key).toBe("now")
    expect([...(binned[0]?.items ?? [])].length).toBe(1)
    expect(binned[1]?.key).toBe("202001010900")
  })

  test("represents timezones correctly", () => {
    const items = [
      {
        start: toTimezone(
          parseISO("2020-01-01T13:00:00-06:00"),
          "America/Chicago",
        ),
        end: toTimezone(
          parseISO("2020-01-01T13:30:00-06:00"),
          "America/Chicago",
        ),
      },
    ]

    const func = makeTimeBinFunc(now)
    const binned = [...func(items)]
    expect(binned[0]?.key).toBe("202001011300")
    expect(binned[0]?.title).toBe("1:00 pm")
  })
})

describe("bin by day", () => {
  test("bin by day", () => {
    const items = [
      {
        start: toTimezone(
          parseISO("2020-01-01T23:59:59-05:00"),
          "America/New_York",
        ),
      },
      {
        start: toTimezone(
          parseISO("2020-01-02T00:00:00-05:00"),
          "America/New_York",
        ),
      },
    ]

    const func = makeDayBinFunc()
    const binned = [...func(items)]
    expect(binned.length).toBe(2)
    expect(binned[0]?.key).toBe("20200101")
    expect(binned[0]?.title).toBe("Wednesday, January 1")
    expect(binned[1]?.key).toBe("20200102")
    expect(binned[1]?.title).toBe("Thursday, January 2")
  })

  test("use day change hour", () => {
    const items = [
      {
        start: toTimezone(
          parseISO("2020-01-01T23:59:59-05:00"),
          "America/New_York",
        ),
      },
      {
        start: toTimezone(
          parseISO("2020-01-02T00:00:00-05:00"),
          "America/New_York",
        ),
      },
    ]

    const func = makeDayBinFunc(3)
    const binned = [...func(items)]
    expect(binned.length).toBe(1)
    expect(binned[0]?.key).toBe("20200101")
    expect(binned[0]?.title).toBe("Wednesday, January 1")
  })
})

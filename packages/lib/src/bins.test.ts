import { describe, expect, test } from "vitest"
import {
  binByName,
  makeDayBinFunc,
  makeTagBinFunc,
  makeTimeBinFunc,
} from "./bins.js"
import { parseISO } from "./date.js"
import dayjs from "dayjs"

describe("bin by name", () => {
  test("basic sorting", () => {
    const items = [
      {
        id: "B",
        name: "B",
      },
      {
        name: "AB",
      },
      {
        name: "aa",
      },
      {
        id: "B",
        name: "B",
      },
    ]

    expect([...binByName(items)]).toStrictEqual([
      {
        key: "A",
        name: "A",
        items: [
          {
            name: "aa",
          },
          {
            name: "AB",
          },
        ],
      },
      {
        key: "B",
        name: "B",
        items: [
          {
            id: "B",
            name: "B",
          },
        ],
      },
    ])
  })

  test("special character handling", () => {
    const items = [
      {
        name: "!A",
      },
      {
        name: "(1)",
      },
    ]

    expect([...binByName(items)]).toStrictEqual([
      {
        key: "#",
        name: "#",
        items: [
          {
            name: "(1)",
          },
        ],
      },
      {
        key: "A",
        name: "A",
        items: [
          {
            name: "!A",
          },
        ],
      },
    ])
  })

  test("handles missing name", () => {
    const items = [{}, { name: "" }]

    expect([...binByName(items)]).toStrictEqual([
      {
        key: "Other",
        name: "Other",
        items: [{}, { name: "" }],
      },
    ])
  })
})

describe("bin by tag", () => {
  const tagEntries = [
    { tag: "a", name: "Tag A" },
    { tag: "b", name: "Tag B" },
  ]

  test("sort and bins by tags", () => {
    const items = [
      {
        keywords: ["a"],
      },
      {
        id: "b",
        keywords: ["b"],
      },
      {
        keywords: ["a"],
      },
      {
        id: "b",
        keywords: ["b"],
      },
    ]

    const func = makeTagBinFunc(tagEntries)

    expect([...func(items)]).toStrictEqual([
      {
        key: "tag-a",
        name: "Tag A",
        items: [{ tags: ["a"] }, { tags: ["a"] }],
      },
      {
        key: "tag-b",
        name: "Tag B",
        items: [{ id: "b", tags: ["b"] }],
      },
    ])
  })

  test("include once per tag", () => {
    const items = [
      {
        keywords: ["a", "b"],
      },
    ]

    const func = makeTagBinFunc(tagEntries)

    expect([...func(items)]).toStrictEqual([
      {
        key: "tag-a",
        name: "Tag A",
        items: [{ keywords: ["a", "b"] }],
      },
      {
        key: "tag-b",
        name: "Tag B",
        items: [{ keywords: ["a", "b"] }],
      },
    ])
  })

  test("omit missing tags", () => {
    const items = [
      {
        keywords: ["a", "c"],
      },
    ]

    const func = makeTagBinFunc(tagEntries)

    expect([...func(items)]).toStrictEqual([
      {
        key: "tag-a",
        name: "Tag A",
        items: [{ keywords: ["a", "c"] }],
      },
    ])
  })

  test("add n/a tag", () => {
    const items = [
      {
        keywords: ["c"],
      },
    ]

    const func = makeTagBinFunc(tagEntries)

    expect([...func(items)]).toStrictEqual([
      {
        key: "na",
        name: "N/A",
        items: [{ keywords: ["c"] }],
      },
    ])
  })
})

describe("bin by time", () => {
  const now = parseISO("2020-01-01T12:00:00")

  test("bins by time", () => {
    const items = [
      {
        startDate: parseISO("2020-01-01T13:01:00"),
        endDate: parseISO("2020-01-01T14:00:00"),
      },
      {
        startDate: parseISO("2020-01-01T13:04:59"),
        endDate: parseISO("2020-01-01T14:00:00"),
      },
      {
        startDate: parseISO("2020-01-01T13:30:00"),
        endDate: parseISO("2020-01-01T14:00:00"),
      },
    ]

    const func = makeTimeBinFunc(now)
    const binned = [...func(items)]
    expect(binned.length).toBe(2)
    expect(binned[0]?.key).toBe("202001011300")
    expect(binned[0]?.name).toBe("1:00 pm")
    expect(
      ([...(binned[0]?.items ?? [])][0]?.startDate ?? dayjs()).isSame(
        parseISO("2020-01-01T13:01:00"),
      ),
    ).toBe(true)
    expect([...(binned[0]?.items ?? [])].length).toBe(2)
    expect(binned[1]?.key).toBe("202001011330")
    expect(binned[1]?.name).toBe("1:30 pm")
    expect([...(binned[1]?.items ?? [])].length).toBe(1)
  })

  test("includes now bin", () => {
    const items = [
      {
        startDate: parseISO("2020-01-01T09:00:00"),
        endDate: parseISO("2020-01-01T10:00:00"),
      },
      {
        startDate: parseISO("2020-01-01T11:00:00"),
        endDate: parseISO("2020-01-01T12:01:00"),
      },
      {
        startDate: parseISO("2020-01-01T13:00:00"),
        endDate: parseISO("2020-01-01T13:30:00"),
      },
    ]

    const func = makeTimeBinFunc(now)
    const binned = [...func(items)]
    expect(binned.length).toBe(3)
    expect(binned[0]?.key).toBe("now")
    expect([...(binned[0]?.items ?? [])].length).toBe(1)
    expect(binned[1]?.key).toBe("202001010900")
  })
})

describe("bin by day", () => {
  test("bin by day", () => {
    const items = [
      {
        startDate: parseISO("2020-01-01T23:59:59"),
      },
      {
        startDate: parseISO("2020-01-02T00:00:00"),
      },
    ]

    const func = makeDayBinFunc()
    const binned = [...func(items)]
    expect(binned.length).toBe(2)
    expect(binned[0]?.key).toBe("20200101")
    expect(binned[0]?.name).toBe("Wednesday, January 1")
    expect(binned[1]?.key).toBe("20200102")
    expect(binned[1]?.name).toBe("Thursday, January 2")
  })

  test("use day change hour", () => {
    const items = [
      {
        startDate: parseISO("2020-01-01T23:59:59"),
      },
      {
        startDate: parseISO("2020-01-02T00:00:00"),
      },
    ]

    const func = makeDayBinFunc(3)
    const binned = [...func(items)]
    expect(binned.length).toBe(1)
    expect(binned[0]?.key).toBe("20200101")
    expect(binned[0]?.name).toBe("Wednesday, January 1")
  })
})

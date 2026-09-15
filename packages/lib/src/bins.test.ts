import dayjs from "dayjs"
import { describe, expect, test } from "vitest"
import {
  binByName,
  makeDayBinFunc,
  makeTagBinFunc,
  makeTimeBinFunc,
} from "./bins.js"
import { parseISO } from "./date.js"

describe("bin by name", () => {
  test("basic sorting", () => {
    const items = [
      {
        item: {
          id: "B",
          name: "B",
        },
      },
      {
        item: {
          name: "AB",
        },
      },
      {
        item: {
          name: "aa",
        },
      },
    ]

    expect([...binByName(items)]).toStrictEqual([
      {
        key: "A",
        name: "A",
        items: [
          {
            item: {
              name: "aa",
            },
          },
          {
            item: {
              name: "AB",
            },
          },
        ],
      },
      {
        key: "B",
        name: "B",
        items: [
          {
            item: {
              id: "B",
              name: "B",
            },
          },
        ],
      },
    ])
  })

  test("special character handling", () => {
    const items = [
      {
        item: {
          name: "!A",
        },
      },
      {
        item: {
          name: "(1)",
        },
      },
    ]

    expect([...binByName(items)]).toStrictEqual([
      {
        key: "#",
        name: "#",
        items: [
          {
            item: {
              name: "(1)",
            },
          },
        ],
      },
      {
        key: "A",
        name: "A",
        items: [
          {
            item: {
              name: "!A",
            },
          },
        ],
      },
    ])
  })

  test("handles missing name", () => {
    const items = [{}, { item: { name: "" } }]

    expect([...binByName(items)]).toStrictEqual([
      {
        key: "Other",
        name: "Other",
        items: [{}, { item: { name: "" } }],
      },
    ])
  })
})

describe("bin by tag", () => {
  const tagEntries = [
    { value: "a", label: "Tag A" },
    { value: "b", label: "Tag B" },
  ]

  test("sort and bins by tags", () => {
    const items = [
      {
        item: {
          tags: ["a"],
        },
      },
      {
        item: {
          id: "b",
          tags: ["b"],
        },
      },
      {
        item: {
          tags: ["a"],
        },
      },
    ]

    const func = makeTagBinFunc(tagEntries)

    expect([...func(items)]).toStrictEqual([
      {
        key: "tag-a",
        name: "Tag A",
        items: [{ item: { tags: ["a"] } }, { item: { tags: ["a"] } }],
      },
      {
        key: "tag-b",
        name: "Tag B",
        items: [{ item: { id: "b", tags: ["b"] } }],
      },
    ])
  })

  test("include once per tag", () => {
    const items = [
      {
        item: {
          tags: ["a", "b"],
        },
      },
    ]

    const func = makeTagBinFunc(tagEntries)

    expect([...func(items)]).toStrictEqual([
      {
        key: "tag-a",
        name: "Tag A",
        items: [{ item: { tags: ["a", "b"] } }],
      },
      {
        key: "tag-b",
        name: "Tag B",
        items: [{ item: { tags: ["a", "b"] } }],
      },
    ])
  })

  test("omit missing tags", () => {
    const items = [
      {
        item: {
          tags: ["a", "c"],
        },
      },
    ]

    const func = makeTagBinFunc(tagEntries)

    expect([...func(items)]).toStrictEqual([
      {
        key: "tag-a",
        name: "Tag A",
        items: [{ item: { tags: ["a", "c"] } }],
      },
    ])
  })

  test("add n/a tag", () => {
    const items = [
      {
        item: {
          tags: ["c"],
        },
      },
    ]

    const func = makeTagBinFunc(tagEntries)

    expect([...func(items)]).toStrictEqual([
      {
        key: "na",
        name: "N/A",
        items: [{ item: { tags: ["c"] } }],
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
        startDate: parseISO("2020-01-02T05:59:59"),
      },
      {
        startDate: parseISO("2020-01-02T06:00:00"),
      },
    ]

    const days = [
      {
        key: "20200101",
        name: "Wednesday, January 1",
        startDate: parseISO("2020-01-01T06:00:00-05:00"),
        endDate: parseISO("2020-01-02T06:00:00-05:00"),
      },
      {
        key: "20200102",
        name: "Thursday, January 2",
        startDate: parseISO("2020-01-02T06:00:00-05:00"),
        endDate: parseISO("2020-01-03T06:00:00-05:00"),
      },
    ]

    const func = makeDayBinFunc(days)
    const binned = [...func(items)]
    expect(binned.length).toBe(2)
    expect(binned[0]?.key).toBe("20200101")
    expect(binned[0]?.name).toBe("Wednesday, January 1")
    expect(binned[1]?.key).toBe("20200102")
    expect(binned[1]?.name).toBe("Thursday, January 2")
  })
})

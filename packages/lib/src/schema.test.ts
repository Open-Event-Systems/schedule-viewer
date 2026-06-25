import { describe, expect, test } from "vitest"
import { dayJSSchema, omitUndefSchema, optional, setSchema } from "./schema.js"
import dayjs from "dayjs"
import z from "zod"

describe("date schemas", () => {
  test("dayjs schema validates type", () => {
    const invalid = new Date()
    const invalidParsed = dayJSSchema.safeParse(invalid)
    expect(invalidParsed.success).toBe(false)
  })

  test("dayjs schema checks valid dates", () => {
    const invalid = dayjs("bad")
    const invalidParsed = dayJSSchema.safeParse(invalid)
    expect(invalidParsed.success).toBe(false)
  })

  test("optional schema omits null", () => {
    const schema = z.object({
      opt: optional(z.string()),
    })

    const res = schema.parse({ opt: null })
    expect(res.opt).toBeUndefined()
  })

  test("omitUndefSchema removes undefined", () => {
    const schema = omitUndefSchema(
      z.object({
        opt: optional(z.string()),
      }),
    )

    const res = schema.parse({ opt: null })
    expect("opt" in res).toBe(false)
  })

  test("set schema", () => {
    const schema = setSchema(z.string())
    const res = schema.parse(["a", "b"])
    expect(res).toBeInstanceOf(Set)
    const items = [...res]
    items.sort()
    expect(items).toStrictEqual(["a", "b"])
  })
})

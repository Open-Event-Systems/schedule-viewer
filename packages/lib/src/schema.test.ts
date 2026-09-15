import dayjs from "dayjs"
import { describe, expect, test } from "vitest"
import z from "zod"
import {
  dayJSSchema,
  durationSchema,
  omitUndefSchema,
  optional,
} from "./schema.js"

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

  test("duration schema checks valid durations", () => {
    const invalid = dayjs.duration("bad")
    const invalidParsed = durationSchema.safeParse(invalid)
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
})

import { isValid, parseISO } from "date-fns"
import z from "zod"

const parseDate = (s: string | Date, ctx: z.RefinementCtx): Date => {
  if (typeof s == "string") {
    const parsed = parseISO(s)
    if (!isValid(parsed)) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid date",
        input: s,
      })
    }
    return parsed
  } else if (s instanceof Date) {
    if (!isValid(s)) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid date",
        input: s,
      })
    }
    return s
  } else {
    ctx.addIssue({
      code: "invalid_type",
      expected: "string",
      input: s,
    })
    return new Date()
  }
}

export const opt = <OutT, InT>(
  s: z.ZodType<OutT, InT>,
): z.ZodType<OutT | undefined, InT | null | undefined> => {
  return s.nullish().transform((v) => v ?? undefined)
}

export const optStr = opt(z.string())
export const strDate = opt(z.preprocess(parseDate, z.date()))

export const strSetSchema = z.union([
  z.set(z.string()),
  z.array(z.string()).transform((v): ReadonlySet<string> => {
    return new Set(v)
  }),
])

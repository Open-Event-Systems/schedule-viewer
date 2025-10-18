import { isValid, parseISO } from "date-fns"
import z from "zod"
import { Contact } from "./types.js"

const parseDate = (s: string, ctx: z.RefinementCtx): Date => {
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
  s: z.ZodType<OutT | undefined, InT>,
): z.ZodType<OutT | undefined, InT | null | undefined> => {
  return s.nullish().transform((v) => v ?? undefined)
}

const optStr = opt(z.string())
const strDate = opt(z.preprocess(parseDate, z.date()))

const contactObjSchema = z
  .looseObject({
    name: optStr,
    url: optStr,
  })
  .partial()

const contactSchema = z
  .union([z.string(), contactObjSchema])
  .transform((v): Contact & { [x: string]: unknown } => {
    if (typeof v == "string") {
      return {
        name: v,
      }
    }
    return v
  })

const strSetSchema = z.array(z.string()).transform((v): ReadonlySet<string> => {
  return new Set(v)
})

export const scheduleItemSchema = z
  .looseObject({
    id: z.string(),
    type: z.string(),
    start: strDate,
    end: strDate,
    title: optStr,
    description: optStr,
    location: optStr,
    contacts: opt(z.array(contactSchema).readonly()),
    tags: opt(strSetSchema),
    icon: optStr,
    image: optStr,
  })
  .partial()
  .required({ id: true, type: true })

export const selectionsSchema = z.object({
  id: opt(z.string()).optional(),
  date: strDate.optional(),
  events: strSetSchema,
})

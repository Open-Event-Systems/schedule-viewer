import { format, parseISO } from "date-fns"
import z from "zod"

/**
 * ISO 8601 formatted date without offset, including milliseconds.
 */
export const isoDate = z.codec(z.string(), z.date({ error: "Invalid date" }), {
  decode: (v) => (typeof v == "string" ? parseISO(v) : v),
  encode: (v) => format(v, "yyyy-MM-dd'T'HH:mm:ss.SSS"),
})

/**
 * An optional schema coercing nulls to undefined.
 */
export const optional = <OutT, InT>(
  s: z.ZodType<OutT, InT>,
): z.ZodOptional<
  z.ZodCodec<
    z.ZodType<OutT | null | undefined, InT | null | undefined>,
    z.ZodType<OutT | undefined, OutT | undefined>
  >
> =>
  z
    .codec(s.nullish(), z.custom<OutT | undefined>(), {
      decode: (v) => (v != null ? v : undefined),
      encode: (v) => (v != null ? v : undefined),
    })
    .optional()

/**
 * Schema for a Set<string>
 */
export const strSet = z.codec(
  z.union([z.array(z.string()), z.set(z.string())]),
  z.custom<Set<string>>(),
  {
    decode: (v) => new Set(v),
    encode: (v) => [...v],
  },
)

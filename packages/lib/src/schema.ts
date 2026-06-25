/**
 * Schemas for parsing schedule data.
 * @module
 */

import z from "zod"

import dayjs, { type Dayjs } from "dayjs"
import { formatISO, parseISO } from "./date.js"
import { omitUndef, type OmitUndef } from "./utils.js"

/**
 * Schema for a {@link Dayjs} instance.
 */
export const dayJSSchema = z
  .custom<Dayjs>((v) => dayjs.isDayjs(v), "Invalid date")
  .superRefine((arg, ctx) => {
    if (!arg.isValid()) {
      ctx.addIssue({
        code: "invalid_type",
        expected: "date",
      })
    }
  })

/**
 * Codec that parses a {@link Dayjs} instance from an ISO string.
 */
export const isoDateTimeSchema = z.codec(z.string(), dayJSSchema, {
  decode: (v) => parseISO(v),
  encode: (v) => formatISO(v),
})

/**
 * Coerce null|undefined to undefined.
 */
export const optional = <OutT, InT>(
  ofSchema: z.ZodType<OutT, InT>,
): z.ZodOptional<
  z.ZodCodec<
    z.ZodType<OutT | null | undefined, InT | null | undefined>,
    z.ZodType<OutT | undefined, OutT | null | undefined>
  >
> =>
  z
    .codec(ofSchema.nullish(), z.custom<OutT | undefined>(), {
      decode: (v) => {
        if (v != null) {
          return v
        }
      },
      encode: (v) => {
        if (v != null) {
          return v
        }
      },
    })
    .optional()

/**
 * Omit undefined properties.
 */
export const omitUndefSchema = <OutT extends object, InT>(
  ofType: z.ZodType<OutT, InT>,
): z.ZodCodec<z.ZodType<OutT, InT>, z.ZodType<OmitUndef<OutT>, OutT>> =>
  z.codec(ofType, z.custom<OmitUndef<OutT>>(), {
    decode: (v) => omitUndef(v),
    encode: (v) => v,
  })

/**
 * Schema for a set of a type.
 */
export const setSchema = <OutT, InT>(
  ofSchema: z.ZodType<OutT, InT>,
): z.ZodCodec<z.ZodType<OutT[], InT[]>, z.ZodType<Set<OutT>, Set<OutT>>> =>
  z.codec(z.array(ofSchema), z.custom<Set<OutT>>(), {
    decode: (v) => new Set(v),
    encode: (v) => [...v],
  })

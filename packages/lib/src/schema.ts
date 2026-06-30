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
 * Convert between a scalar and array.
 */
export const scalarToArraySchema = <OutT, InT>(
  ofSchema: z.ZodType<OutT, InT>,
): z.ZodOptional<
  z.ZodCodec<
    z.ZodType<OutT | undefined, InT | undefined>,
    z.ZodType<OutT[] | undefined, OutT[] | undefined>
  >
> =>
  z
    .codec(ofSchema.optional(), z.array(z.custom<OutT>()).optional(), {
      decode: (v) => {
        if (v !== undefined) {
          return [v]
        }
      },
      encode: (v) => {
        if (v != undefined && v.length > 0) {
          return v[0]
        }
      },
    })
    .optional()

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

/**
 * Preprocesses strings by calling .trim().
 */
export const trimStrSchema = <OutT, InT>(
  ofType: z.ZodType<OutT, InT>,
): z.ZodType<OutT, InT> =>
  z.codec(z.custom<InT>(), ofType, {
    decode: (v) => {
      if (typeof v == "string") {
        return v.trim() as InT
      } else {
        return v
      }
    },
    encode: (v) => {
      if (typeof v == "string") {
        return v.trim() as InT
      } else {
        return v
      }
    },
  })

/**
 * Preprocesses strings by replacing empty strings with undefined.
 */
export const optStrSchema = <OutT, InT>(
  ofType: z.ZodType<OutT, InT>,
): z.ZodOptional<z.ZodType<OutT | undefined, InT>> =>
  z
    .codec(trimStrSchema(z.custom<InT>()), optional(ofType), {
      decode: (v) => (typeof v == "string" && v ? v : (undefined as InT)),
      encode: (v) => (typeof v == "string" && v ? v : (undefined as InT)),
    })
    .optional()

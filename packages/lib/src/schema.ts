/**
 * Schemas for parsing schedule data.
 * @module
 */

import dayjs, { type Dayjs } from "dayjs"
import { type Duration } from "dayjs/plugin/duration.js"
import z from "zod"
import { formatDuration, formatISO, parseDuration, parseISO } from "./date.js"
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
        message: "Invalid date",
      })
    }
  })

/**
 * Schema for a {@link Duration} instance.
 */
export const durationSchema = z
  .custom<Duration>((v) => dayjs.isDuration(v), "Invalid duration")
  .superRefine((arg, ctx) => {
    if (isNaN(arg.asSeconds())) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid duration",
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
 * Codec that parses a {@link Duration} instance from an ISO string.
 */
export const isoDurationSchema = z.codec(z.string(), durationSchema, {
  decode: (v) => parseDuration(v),
  encode: (v) => formatDuration(v),
})

/**
 * Coerce null|undefined to undefined.
 */
export const optional = <OutT, InT>(
  ofSchema: z.ZodType<OutT, InT>,
): z.ZodCodec<
  z.ZodOptional<z.ZodNullable<z.ZodType<OutT, InT>>>,
  z.ZodOptional<z.ZodType<OutT, OutT>>
> =>
  z.codec(ofSchema.nullish(), z.custom<OutT>().optional(), {
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

// export const optional = <OutT, InT>(
//   ofSchema: z.ZodType<OutT, InT>,
// ): z.ZodOptional<
//   z.ZodCodec<
//     z.ZodType<OutT | null | undefined, InT | null | undefined>,
//     z.ZodType<OutT | undefined, OutT | null | undefined>
//   >
// > =>
//   z
//     .codec(ofSchema.nullish(), z.custom<OutT | undefined>(), {
//       decode: (v) => {
//         if (v != null) {
//           return v
//         }
//       },
//       encode: (v) => {
//         if (v != null) {
//           return v
//         }
//       },
//     })
//     .optional()

/**
 * Like {@link optional} but results in a default value if nullish.
 */
export const optionalDefaultSchema = <OutT, InT>(
  ofSchema: z.ZodType<OutT, InT>,
  defaultValue: OutT,
): z.ZodCodec<
  z.ZodOptional<z.ZodNullable<z.ZodType<OutT, InT>>>,
  z.ZodType<OutT, OutT>
> =>
  z.codec(ofSchema.nullish(), z.custom<OutT>(), {
    decode: (v) => (v == null ? defaultValue : v),
    encode: (v) => v,
  })

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
 * Schema that transforms an array to a Set.
 */
export const arrToSetSchema = <ArrT, InT>(
  arrType: z.ZodType<ArrT[], InT>,
): z.ZodCodec<z.ZodType<ArrT[], InT>, z.ZodType<Set<ArrT>, Set<ArrT>>> =>
  z.codec(arrType, z.custom<Set<ArrT>>(), {
    decode: (v) => new Set(v),
    encode: (v) => [...v],
  })

import z from "zod"

export const parseSearch = (search: string): Record<string, unknown> => {
  if (search[0] == "?") {
    search = search.substring(1)
  }

  const params = new URLSearchParams(search)
  const entries: Record<string, string[]> = {}

  for (const [k, v] of params.entries()) {
    let values = entries[k]
    if (!values) {
      values = []
      entries[k] = values
    }

    values.push(v)
  }

  const parsed: Record<string, string | string[] | undefined> = {}

  for (const [k, values] of Object.entries(entries)) {
    if (values.length <= 1) {
      parsed[k] = values[0]
    } else {
      parsed[k] = values
    }
  }

  return parsed
}

export const stringifySearch = (search: Record<string, unknown>): string => {
  const params = new URLSearchParams()

  for (const [k, values] of Object.entries(search)) {
    if (Array.isArray(values)) {
      for (const v of values) {
        params.append(k, String(v))
      }
    } else {
      if (values != null) {
        params.append(k, String(values))
      }
    }
  }

  const paramsStr = String(params)

  return paramsStr == "" ? "" : `?${paramsStr}`
}


export type PageSearchParams = Readonly<{
  view?: string
  day?: string
  search?: string
  past?: boolean
  bookmarked?: boolean
  unvisited?: boolean
}>

const boolSchema = z.codec(
  z.union([z.literal(["true", "false"]), z.boolean()]),
  z.boolean(),
  {
    decode: (v) => v === true || v == "true",
    encode: (v) => v ? "true" : "false"
  }
)

export const pageSearchParamsSchema = z.object({
  view: z.optional(z.string()).catch(undefined),
  day: z.optional(z.string()).catch(undefined),
  search: z.optional(z.string()).catch(undefined),
  past: z.optional(boolSchema).catch(undefined),
  bookmarked: z.optional(boolSchema).catch(undefined),
  unvisited: z.optional(boolSchema).catch(undefined),
})


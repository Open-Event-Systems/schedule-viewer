import z from "zod"
import wretch from "wretch"
import type { Parser, ScheduleAPI, ScheduleObject } from "./types.js"

const itemsSchema = z.looseObject({
  items: z.array(z.unknown()),
})

/**
 * Make a {@link ScheduleAPI} that returns items parsed from an iterable.
 */
export const makeParsedScheduleItemsAPI = (
  parser: Parser<ScheduleObject>,
  items?: Iterable<unknown> | null,
  options?: {
    name?: string
  }
): ScheduleAPI => {
  const name = options?.name || "data source"
  return {
    async getItems() {
      const parsed: ScheduleObject[] = []

      let i = 0

      for (const obj of items ?? []) {
        const parseResult = parser(obj)
        if (parseResult.success) {
          parsed.push(parseResult.data)
        } else {
          console.error(
            `failed to parse item ${i} from ${name}:\n` +
            `${parseResult.message}`,
            obj
          )
        }
        i++
      }

      return parsed
    }
  }
}

/**
 * Make a {@link ScheduleAPI} that returns items from a URL.
 */
export const makeScheduleFetchAPI = (parser: Parser<ScheduleObject>, url: string) => {
  return {
    async getItems() {
      const res = await wretch(url).get().json()
      const respBody = itemsSchema.parse(res)
      const arrAPI = makeParsedScheduleItemsAPI(parser, respBody.items, { name: url })
      return await arrAPI.getItems()
    },
  }
}

/**
 * Return a {@link ScheduleAPI} that concatenates results.
 */
export const composeScheduleAPIs = (...objs: ScheduleAPI[]): ScheduleAPI => {
  return {
    async getItems() {
      const results = await Promise.all(objs.map((o) => o.getItems()))
      const concat: ScheduleObject[] = []
      results.forEach((res) => {
        concat.push(...res)
      })
      return concat
    },
  }
}

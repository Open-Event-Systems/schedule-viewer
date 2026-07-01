import z from "zod"
import wretch from "wretch"
import type { ScheduleAPI, ScheduleItem } from "./types.js"
import { sortScheduleItems } from "./utils.js"
import { parseScheduleItem } from "./parse/json.js"
import { intervalToTz } from "./date.js"
import { getEmbeddedItems } from "./data.js"

const itemsSchema = z.object({
  items: z.array(z.record(z.string(), z.unknown())),
})

/**
 * Make a {@link ScheduleAPI} that returns items parsed from an iterable.
 */
export const makeParsedScheduleItemsAPI = (
  items: Iterable<unknown>,
): ScheduleAPI => {
  const itemsArr = [...items]
  return {
    async getItems() {
      const parsedItems = itemsArr
        .map(parseScheduleItem)
        .map((parsed) => {
          if (parsed.success) {
            return parsed.data
          } else {
            console.error(
              `failed to parse schedule item:\n${parsed.message}`,
              parsed,
            )
            return undefined
          }
        })
        .filter((v) => !!v)

      const withEmbedded = []

      for (const item of parsedItems) {
        withEmbedded.push(item, ...getEmbeddedItems(item))
      }

      return withEmbedded
    },
  }
}

/**
 * Make a {@link ScheduleAPI} that returns items from a URL.
 */
export const makeScheduleFetchAPI = (url: string) => {
  return {
    async getItems() {
      const res = await wretch(url).get().json()
      const respBody = itemsSchema.parse(res)
      const arrAPI = makeParsedScheduleItemsAPI(respBody.items)
      return await arrAPI.getItems()
    },
  }
}

/**
 * Wrap a {@link ScheduleAPI} to change all dates to the given time zone.
 */
export const makeZonedScheduleAPI = (
  api: ScheduleAPI,
  timeZone: string,
): ScheduleAPI => {
  return {
    async getItems() {
      const results = await api.getItems()
      const zoned = []

      for (const item of results) {
        if ("startDate" in item || "endDate" in item) {
          zoned.push(intervalToTz(timeZone, item))
        } else {
          zoned.push(item)
        }
      }

      return zoned
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
      const concat: ScheduleItem[] = []
      results.forEach((res) => {
        concat.push(...res)
      })
      return concat
    },
  }
}

/**
 * Wrap a {@link ScheduleAPI} to sort the items.
 */
export const makeSortedScheduleAPI = (api: ScheduleAPI): ScheduleAPI => {
  return {
    async getItems() {
      const res = await api.getItems()
      const arr = [...res]
      return sortScheduleItems(arr)
    },
  }
}

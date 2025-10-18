import z from "zod"
import wretch from "wretch"
import { ScheduleAPI, ScheduleItem } from "./types.js"
import { intervalToTimezone } from "./time.js"
import { scheduleItemSchema } from "./schema.js"
import { sortScheduleItems } from "./utils.js"

const itemsSchema = z.object({
  items: z.array(z.record(z.string(), z.unknown())),
})

/**
 * Make a {@link ScheduleAPI} that returns items from a URL.
 */
export const makeScheduleFetchAPI = (url: string): ScheduleAPI => {
  return {
    async getItems() {
      const res = await wretch(url).get().json()
      const respBody = itemsSchema.parse(res)

      return respBody.items
        .map((data, i) => {
          const parsed = scheduleItemSchema.safeParse(data)
          if (parsed.success) {
            return parsed.data
          } else {
            console.error(
              `fetching ${url}: failed to parse schedule item ${i}:\n${z.prettifyError(parsed.error)}`,
            )
            return undefined
          }
        })
        .filter((v) => !!v)
    },
  }
}

/**
 * Make a {@link ScheduleAPI} that returns items from an array.
 */
export const makeScheduleItemsAPI = (
  items: readonly ScheduleItem[],
): ScheduleAPI => {
  return {
    async getItems() {
      return items
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
 * Wrap a {@link ScheduleAPI} to make its items use TZ aware dates.
 */
export const makeTZScheduleAPI = (
  api: ScheduleAPI,
  tz?: string,
): ScheduleAPI => {
  return {
    async getItems() {
      const items = await api.getItems()
      return items.map((item) => {
        const newDates = intervalToTimezone(item, tz)
        return {
          ...item,
          ...newDates,
        }
      })
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

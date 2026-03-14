import {
  makeParsedScheduleItemsAPI,
  parseItems,
  type ItemParserMap,
  type ItemTypeMap,
  type ParseItemsResult,
  type ScheduleAPI,
  type ScheduleItemDetails,
} from "@open-event-systems/schedule-lib"
import type { TagEntry } from "../types.js"
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query"
import { createContext, useContext, useMemo } from "react"
import { scheduleQueryOptions, useScheduleConfig } from "./config.js"

export const ScheduleAPIContext = createContext<ScheduleAPI>(
  makeParsedScheduleItemsAPI([]),
)
export const ScheduleAPIProvider = ScheduleAPIContext.Provider
export const useScheduleAPI = (): ScheduleAPI => useContext(ScheduleAPIContext)

/**
 * Query options factory for schedule items.
 */
export const itemQueryOptions = {
  items: <M extends ItemTypeMap>(
    api: ScheduleAPI,
    scheduleId: string,
    parsers: ItemParserMap<M>,
  ) =>
    queryOptions({
      queryKey: [
        ...scheduleQueryOptions.schedule(scheduleId),
        "items",
        Object.keys(parsers).sort(),
      ] as const,
      queryFn: async () => {
        const res = await api.getItems()
        return parseItems(parsers, res)
      },
      staleTime: 300000,
    }),
} as const

/**
 * Hook to use the configured schedule's items.
 */
export const useItems = <M extends ItemTypeMap>(
  parsers: ItemParserMap<M>,
): Readonly<ParseItemsResult<M>> => {
  const config = useScheduleConfig()
  const api = useScheduleAPI()
  const res = useSuspenseQuery(itemQueryOptions.items(api, config.id, parsers))
  return res.data
}

/**
 * Filter a collection of {@link TagEntry} to only include those that are
 * referenced in `items`.
 */
export const getRelevantTags = (
  tags: Iterable<TagEntry>,
  items: Iterable<Pick<ScheduleItemDetails, "tags">>,
): TagEntry[] => {
  const seen = new Set<string>()

  for (const item of items) {
    for (const tag of item.tags ?? []) {
      seen.add(tag)
    }
  }

  return [...tags].filter((t) => seen.has(t.tag))
}

/**
 * Hook that filters a collection of {@link TagEntry} to only include those that
 * are referenced in `items`.
 */
export const useRelevantTags = (
  tags: Iterable<TagEntry>,
  items: Iterable<Pick<ScheduleItemDetails, "tags">>,
): TagEntry[] => {
  return useMemo(() => {
    return getRelevantTags(tags, items)
  }, [tags, items])
}

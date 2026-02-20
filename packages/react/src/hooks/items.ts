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
import { useSuspenseQuery } from "@tanstack/react-query"
import { createContext, useContext, useMemo } from "react"
import { useScheduleConfig } from "./config.js"

export const ScheduleAPIContext = createContext<ScheduleAPI>(
  makeParsedScheduleItemsAPI([]),
)
export const ScheduleAPIProvider = ScheduleAPIContext.Provider
export const useScheduleAPI = (): ScheduleAPI => useContext(ScheduleAPIContext)

export const itemsQueryKeys = {
  items: <M extends ItemTypeMap>(
    scheduleId: string,
    parsers: ItemParserMap<M>,
  ) => ["schedule", scheduleId, Object.keys(parsers)] as const,
} as const

export const itemsQueryFns = {
  items: <M extends ItemTypeMap>(
    api: ScheduleAPI,
    parsers: ItemParserMap<M>,
  ) => {
    return async () => {
      const res = await api.getItems()
      const parsed = parseItems(parsers, res)
      return parsed
    }
  },
}

export const useItems = <M extends ItemTypeMap>(
  parsers: ItemParserMap<M>,
): Readonly<ParseItemsResult<M>> => {
  const config = useScheduleConfig()
  const api = useScheduleAPI()
  const res = useSuspenseQuery({
    queryKey: itemsQueryKeys.items(config.id, parsers),
    queryFn: itemsQueryFns.items(api, parsers),
    staleTime: 300000,
  })
  return res.data
}

export const useRelevantTags = (
  tags: Iterable<TagEntry>,
  items: Iterable<Pick<ScheduleItemDetails, "tags">>,
): readonly TagEntry[] => {
  return useMemo(() => {
    const seen = new Set<string>()

    for (const item of items) {
      for (const tag of item.tags ?? []) {
        seen.add(tag)
      }
    }

    return [...tags].filter((t) => seen.has(t.tag))
  }, [tags, items])
}

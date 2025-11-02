import {
  makeScheduleItemsArrayAPI,
  parseItems,
  type ItemParserMap,
  type ItemTypeMap,
  type ParseItemsResult,
  type ScheduleAPI,
  type ScheduleItem,
} from "@open-event-systems/schedule-lib"
import type { ScheduleConfig, TagEntry } from "../types.js"
import {
  useSuspenseQuery,
  type UseSuspenseQueryOptions,
} from "@tanstack/react-query"
import { createContext, useContext, useMemo } from "react"
import { useScheduleConfig } from "./config.js"

export const ScheduleAPIContext = createContext<ScheduleAPI>(
  makeScheduleItemsArrayAPI([]),
)
export const ScheduleAPIProvider = ScheduleAPIContext.Provider
export const useScheduleAPI = (): ScheduleAPI => useContext(ScheduleAPIContext)

export const getItemsQueryOptions = <M extends ItemTypeMap>(
  config: ScheduleConfig,
  api: ScheduleAPI,
  parsers: ItemParserMap<M>,
): UseSuspenseQueryOptions<ParseItemsResult<M>> => {
  const keys = Object.keys(parsers)
  return {
    queryKey: ["schedule", config.id, "items", keys],
    async queryFn() {
      const res = await api.getItems()
      const parsed = parseItems(parsers, res)
      return parsed
    },
    staleTime: 300000,
  }
}

export const useItems = <M extends ItemTypeMap>(
  parsers: ItemParserMap<M>,
): Readonly<ParseItemsResult<M>> => {
  const config = useScheduleConfig()
  const api = useScheduleAPI()
  const res = useSuspenseQuery(getItemsQueryOptions(config, api, parsers))
  return res.data
}

export const useRelevantTags = (
  tags: Iterable<TagEntry>,
  items: Iterable<ScheduleItem & { readonly tags?: Iterable<string> }>,
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

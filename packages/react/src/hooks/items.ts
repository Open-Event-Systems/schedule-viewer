import {
  indexData,
  makeParsedScheduleItemsAPI,
  type IndexConfig,
  type IndexResult,
  type ScheduleAPI,
  type ScheduleDataTypeMap,
  type ScheduleItem,
} from "@open-event-systems/schedule-lib"
import type { TagConfigEntry } from "../types.js"
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query"
import { createContext, useContext, useMemo } from "react"
import { scheduleQueryOptions, useScheduleConfig } from "./config.js"
import type { ItemDetailsProps } from "../components/index.js"

export const ScheduleAPIContext = createContext<ScheduleAPI>(
  makeParsedScheduleItemsAPI([]),
)
export const ScheduleAPIProvider = ScheduleAPIContext.Provider
export const useScheduleAPI = (): ScheduleAPI => useContext(ScheduleAPIContext)

/**
 * Query options factory for schedule items.
 */
export const itemQueryOptions = {
  items: <M extends ScheduleDataTypeMap>(
    api: ScheduleAPI,
    scheduleId: string,
    parsers: IndexConfig<M>,
  ) =>
    queryOptions({
      queryKey: [
        ...scheduleQueryOptions.schedule(scheduleId),
        "items",
        Object.keys(parsers).sort(),
      ] as const,
      queryFn: async () => {
        const res = await api.getItems()
        return indexData(parsers, res)
      },
      staleTime: 300000,
    }),
} as const

/**
 * Hook to use the configured schedule's items.
 */
export const useItems = <M extends ScheduleDataTypeMap>(
  parsers: IndexConfig<M>,
): Readonly<IndexResult<M>> => {
  const config = useScheduleConfig()
  const api = useScheduleAPI()
  const res = useSuspenseQuery(itemQueryOptions.items(api, config.id, parsers))
  return res.data
}

/**
 * Filter a collection of {@link TagConfigEntry} to only include those that are
 * referenced in `items`.
 */
export const getRelevantTags = (
  tags: Iterable<TagConfigEntry>,
  items?: Iterable<{ readonly keywords?: Iterable<string> }> | null,
): TagConfigEntry[] => {
  const seen = new Set<string>()

  for (const item of items ?? []) {
    for (const tag of item.keywords ?? []) {
      seen.add(tag)
    }
  }

  return [...tags].filter((t) => seen.has(t.tag))
}

/**
 * Hook that filters a collection of {@link TagConfigEntry} to only include those that
 * are referenced in `items`.
 */
export const useRelevantTags = (
  tags: Iterable<TagConfigEntry>,
  items?: Iterable<{ readonly keywords?: Iterable<string> }>,
): TagConfigEntry[] => {
  return useMemo(() => {
    return items ? getRelevantTags(tags, items) : []
  }, [tags, items])
}

/**
 * Get {@link ItemDetailsProps} from item entries.
 */
export const getItemDetailsProps = (
  item: ScheduleItem,
  ...otherItems: ScheduleItem[]
): ItemDetailsProps => {
  const occurrences = []

  for (const itemOcc of [item, ...otherItems]) {
    occurrences.push({
      startDate: "startDate" in itemOcc ? itemOcc.startDate : undefined,
      endDate: "endDate" in itemOcc ? itemOcc.endDate : undefined,
      location: "location" in itemOcc ? itemOcc.location : undefined,
    })
  }

  const organizer = "organizer" in item ? item.organizer : undefined
  const performer = "performer" in item ? item.performer : undefined
  const keywords = "keywords" in item ? item.keywords : undefined

  return {
    itemId: item.id,
    occurrences,
    name: item.name,
    description: item.description,
    organizer,
    performer,
    keywords,
  }
}

import {
  iterToArr,
  type DetailedScheduleItem,
  type ScheduleItem,
  type Selections,
} from "@open-event-systems/schedule-lib"
import {
  sessionSelectionsQueryOptions,
  useSessionSelectionsAPI,
} from "@open-event-systems/schedule-react"
import { useQuery } from "@tanstack/react-query"
import { createStore, type StoreApi } from "zustand"
import { createContext, useMemo } from "react"
import { useViewerConfig, type PageConfig } from "./config.js"

export type FilterState = Readonly<{
  text: string
  disabledTags: ReadonlySet<string>
  setText: (text: string) => void
  setDisabledTags: (tags: Iterable<string>) => void
  setTagDisabled: (tag: string, disabled: boolean) => void
}>

export const makeFilterStateStore = (): StoreApi<FilterState> => {
  return createStore<FilterState>()((set) => ({
    text: "",
    disabledTags: new Set<string>(),
    setText: (text) => set({ text }),
    setDisabledTags: (tags) => {
      set({ disabledTags: new Set(tags) })
    },
    setTagDisabled: (tag, disabled) => {
      set(({ disabledTags: curTags }) => {
        const newSet = new Set(curTags)
        if (disabled) {
          newSet.add(tag)
        } else {
          newSet.delete(tag)
        }
        return { disabledTags: newSet }
      })
    },
  }))
}

export const FilterStateStoreContext = createContext<
  StoreApi<FilterState> | undefined
>(undefined)

export const useSessionSelectionsIfEnabled = (
  onlyBookmarked?: boolean,
): Selections | undefined => {
  const api = useSessionSelectionsAPI("bookmarks")
  const config = useViewerConfig()

  const query = useQuery({
    ...sessionSelectionsQueryOptions.sessionSelections(
      api,
      config.id,
      "bookmarks",
    ),
    subscribed: !!onlyBookmarked,
    enabled: !!onlyBookmarked,
  })

  return query.data
}

export const usePageFilteredItems = <T extends DetailedScheduleItem>(
  pageConfig: PageConfig,
  items?: Iterable<T>,
): Iterable<T> => {
  return useMemo(() => {
    const typeFilter = makeTypeFilter(pageConfig.onlyType)
    const reqTagsFilter = makeRequireTagsFilter(pageConfig.requireTags)

    const byType = iterToArr(items).filter(typeFilter)
    const byReqTags = byType.filter(reqTagsFilter)
    return byReqTags
  }, [items, pageConfig])
}

export const makeTypeFilter = (
  option?: string | readonly string[],
): ((item: ScheduleItem) => boolean) => {
  const reqTypes: string[] = []

  if (typeof option == "string") {
    reqTypes.push(option)
  } else if (Array.isArray(option)) {
    reqTypes.push(...option)
  }

  if (reqTypes.length == 0) {
    return () => true
  }

  return (item) => reqTypes.includes(item.type)
}

export const makeRequireTagsFilter = (
  option?: readonly string[],
): ((
  item: ScheduleItem & { readonly tags?: ReadonlySet<string> },
) => boolean) => {
  const reqTags = option ?? []

  return (item) => {
    for (const reqTag of reqTags) {
      if (!item.tags || !item.tags.has(reqTag)) {
        return false
      }
    }

    return true
  }
}

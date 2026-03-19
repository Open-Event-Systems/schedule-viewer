import {
  makeScheduleItemCollection,
  type DetailedScheduleItem,
  type ScheduleItem,
  type ScheduleItemCollection,
  type SessionSelections,
} from "@open-event-systems/schedule-lib"
import {
  selectionsQueryOptions,
  useSelectionsAPI,
} from "@open-event-systems/schedule-react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { atom, type Atom, type PrimitiveAtom, type WritableAtom } from "jotai"
import { createContext, useCallback, useMemo } from "react"
import { useViewerConfig, type PageConfig } from "./config.js"

export type FilterStateAtom = Atom<
  Readonly<{
    text: PrimitiveAtom<string>
    disabledTags: WritableAtom<
      ReadonlySet<string>,
      [Iterable<string> | ((prev: ReadonlySet<string>) => Iterable<string>)],
      void
    >
  }>
>

export const makeFilterStateAtom = (): FilterStateAtom => {
  const baseDisabledTags = atom(new Set<string>())

  return atom({
    text: atom(""),
    disabledTags: atom(
      (get) => get(baseDisabledTags),
      (
        get,
        set,
        update:
          | Iterable<string>
          | ((prev: ReadonlySet<string>) => Iterable<string>),
      ) => {
        let newVal
        if (typeof update == "function") {
          newVal = update(get(baseDisabledTags))
        } else {
          newVal = update
        }

        newVal = newVal instanceof Set ? newVal : new Set(newVal)

        set(baseDisabledTags, newVal)
      },
    ),
  })
}

export const FilterStateAtomContext = createContext(makeFilterStateAtom())

export const useSessionSelectionsIfEnabled = (
  onlyBookmarked?: boolean,
): SessionSelections | undefined => {
  const api = useSelectionsAPI()
  const config = useViewerConfig()

  const select = useCallback(
    (value: SessionSelections) => {
      return onlyBookmarked ? value : undefined
    },
    [onlyBookmarked],
  )

  const query = useSuspenseQuery({
    ...selectionsQueryOptions.sessionSelections(api, config.id, "bookmarks"),
    select,
  })

  return query.data
}

export const usePageFilteredItems = <T extends DetailedScheduleItem>(
  items: ScheduleItemCollection<T>,
  pageConfig: PageConfig,
): ScheduleItemCollection<T> => {
  return useMemo(() => {
    const typeFilter = makeTypeFilter(pageConfig.onlyType)
    const reqTagsFilter = makeRequireTagsFilter(pageConfig.requireTags)

    const byType = makeScheduleItemCollection(items.filter(typeFilter))
    const byReqTags = makeScheduleItemCollection(byType.filter(reqTagsFilter))
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

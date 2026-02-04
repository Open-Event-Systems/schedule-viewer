import {
  makeBookmarkFilter,
  makePastItemFilter,
  makeTagFilter,
  makeTitleFilter,
  ScheduleItemStore,
  type ScheduleItem,
  type Selections,
} from "@open-event-systems/schedule-lib"
import { createContext, useContext, useMemo, useReducer } from "react"
import type { ReadonlyBasicSet } from "../utils/basic-set.js"

export type FilterStateValue = Readonly<{
  disabledTags?: ReadonlyBasicSet<string>
  text?: string
  showPastEvents?: boolean
  onlyBookmarked?: boolean
}>

export type FilterUpdateValue = Readonly<{
  enableTag?: string
  disableTag?: string
  text?: string
  showPastEvents?: boolean
  onlyBookmarked?: boolean
}>

export type FilterContextValue = readonly [
  FilterStateValue,
  (update: FilterUpdateValue) => void,
]

export const FilterContext = createContext<FilterContextValue>([{}, () => {}])

export const useFilterState = (): FilterContextValue => {
  return useReducer(
    (prevState: FilterStateValue, action: Partial<FilterUpdateValue>) => {
      const { enableTag, disableTag, ...other } = action
      let disabledTags = prevState.disabledTags

      if (enableTag || disableTag) {
        const newSet = new Set(prevState.disabledTags)

        if (enableTag) {
          newSet.delete(enableTag)
        }

        if (disableTag) {
          newSet.add(disableTag)
        }

        disabledTags = newSet
      }

      return {
        ...prevState,
        ...other,
        disabledTags,
      }
    },
    {},
  )
}

export const useFilteredItems = <
  T extends ScheduleItem & {
    readonly title?: string
    readonly tags?: ReadonlySet<string>
  },
>(
  items: ScheduleItemStore<T>,
  now: Date,
  selections?: Selections,
): ScheduleItemStore<T> => {
  const [filter] = useContext(FilterContext)
  const byBookmarked = useMemo(() => {
    if (filter.onlyBookmarked) {
      return selections
        ? items.filter(makeBookmarkFilter(selections.items))
        : new ScheduleItemStore([])
    } else {
      return items
    }
  }, [filter.onlyBookmarked, items, selections])
  const byTag = useMemo(
    () =>
      filter.disabledTags
        ? byBookmarked.filter(makeTagFilter(filter.disabledTags))
        : byBookmarked,
    [byBookmarked, filter.disabledTags],
  )
  const byPast = useMemo(
    () =>
      !filter.showPastEvents ? byTag.filter(makePastItemFilter(now)) : byTag,
    [filter.showPastEvents, byTag, now],
  )
  const byTitle = useMemo(
    () => (filter.text ? byPast.filter(makeTitleFilter(filter.text)) : byPast),
    [filter.text, byPast],
  )

  return byTitle
}

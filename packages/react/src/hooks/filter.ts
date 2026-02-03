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

export type FilterStateValue = Readonly<{
  disabledTags?: ReadonlySet<string>
  text?: string
  showPastEvents?: boolean
  onlyBookmarked?: boolean
}>

export type FilterContextValue = readonly [
  FilterStateValue,
  (update: Partial<FilterStateValue>) => void,
]

export const FilterContext = createContext<FilterContextValue>([{}, () => {}])

export const useFilterState = (): FilterContextValue => {
  return useReducer(
    (prevState: FilterStateValue, action: Partial<FilterStateValue>) => {
      return {
        ...prevState,
        ...action,
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

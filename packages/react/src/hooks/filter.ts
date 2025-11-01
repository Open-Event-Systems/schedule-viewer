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

export type FilterSettings = Readonly<{
  text: string
  disabledTags: ReadonlySet<string>
  onlyBookmarked: boolean
  showPast: boolean
}>

export const FilterContext = createContext<
  readonly [FilterSettings, (update: Partial<FilterSettings>) => void]
>([
  {
    text: "",
    disabledTags: new Set(),
    onlyBookmarked: false,
    showPast: false,
  },
  () => {},
])
export const useFilter = (): readonly [
  FilterSettings,
  (update: Partial<FilterSettings>) => void,
] => useContext(FilterContext)

export const useFilterState = (): readonly [
  FilterSettings,
  (update: Partial<FilterSettings>) => void,
] => {
  const reducer = (
    state: FilterSettings,
    action: Partial<FilterSettings>,
  ): FilterSettings => {
    const newState = {
      ...state,
      ...action,
    }
    return newState
  }

  return useReducer(reducer, {
    text: "",
    disabledTags: new Set(),
    onlyBookmarked: false,
    showPast: false,
  })
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
  const [filter] = useFilter()
  const byBookmarked = useMemo(() => {
    if (filter.onlyBookmarked) {
      return selections
        ? items.filter(makeBookmarkFilter(selections.events))
        : new ScheduleItemStore([])
    } else {
      return items
    }
  }, [filter.onlyBookmarked, items, selections])
  const byTag = useMemo(
    () => byBookmarked.filter(makeTagFilter(filter.disabledTags)),
    [byBookmarked, filter.disabledTags],
  )
  const byPast = useMemo(
    () => (!filter.showPast ? byTag.filter(makePastItemFilter(now)) : byTag),
    [filter.showPast, byTag, now],
  )
  const byTitle = useMemo(
    () => (filter.text ? byPast.filter(makeTitleFilter(filter.text)) : byPast),
    [filter.text, byPast],
  )

  return byTitle
}

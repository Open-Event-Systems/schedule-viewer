import {
  makeBookmarkFilter,
  makePastItemFilter,
  makeScheduleItemCollection,
  makeTagFilter,
  makeTitleFilter,
  type DetailedScheduleItem,
  type ScheduleItemCollection,
  type Selections,
} from "@open-event-systems/schedule-lib"
import { createContext, use, useMemo } from "react"

export type FilterSettings = Readonly<{
  disabledTags?: ReadonlySet<string>
  text?: string
  showPastEvents?: boolean
  onlyBookmarked?: boolean
  selectedDayKey?: string
}>

export const FilterContext = createContext<
  readonly [FilterSettings, (action: Partial<FilterSettings>) => void]
>([{}, () => {}])

export const useFilteredItems = <T extends DetailedScheduleItem>(
  items: ScheduleItemCollection<T>,
  now: Date,
  selections?: Selections,
): ScheduleItemCollection<T> => {
  const [filter] = use(FilterContext)
  const byBookmarked = useMemo(() => {
    if (filter.onlyBookmarked) {
      return makeScheduleItemCollection(
        selections ? items.filter(makeBookmarkFilter(selections)) : [],
      )
    } else {
      return items
    }
  }, [filter.onlyBookmarked, items, selections])
  const byTag = useMemo(
    () =>
      filter.disabledTags
        ? makeScheduleItemCollection(
            byBookmarked.filter(makeTagFilter(filter.disabledTags)),
          )
        : byBookmarked,
    [byBookmarked, filter.disabledTags],
  )
  const byPast = useMemo(
    () =>
      !filter.showPastEvents
        ? makeScheduleItemCollection(byTag.filter(makePastItemFilter(now)))
        : byTag,
    [filter.showPastEvents, byTag, now],
  )
  const byTitle = useMemo(
    () =>
      filter.text
        ? makeScheduleItemCollection(
            byPast.filter(makeTitleFilter(filter.text)),
          )
        : byPast,
    [filter.text, byPast],
  )

  return byTitle
}

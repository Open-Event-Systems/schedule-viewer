import {
  makeBookmarkFilter,
  makePastItemFilter,
  makeTagFilter,
  makeTitleFilter,
  ScheduleItemStore,
  type ScheduleItem,
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

export type FilterUpdateAction = Readonly<{
  disabledTags?: ReadonlySet<string>
  text?: string
  showPastEvents?: boolean
  onlyBookmarked?: boolean
  selectedDayKey?: string
}>

export const FilterContext = createContext<
  readonly [FilterSettings, (action: FilterUpdateAction) => void]
>([{}, () => {}])

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
  const [filter] = use(FilterContext)
  const byBookmarked = useMemo(() => {
    if (filter.onlyBookmarked) {
      return selections
        ? items.filter(makeBookmarkFilter(selections))
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

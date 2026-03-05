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
import { useMemo } from "react"

export type FilterOptions = Readonly<{
  disabledTags?: ReadonlySet<string>
  text?: string
  showPastEvents?: boolean
  onlyBookmarked?: boolean
}>

export const useFilteredItems = <T extends DetailedScheduleItem>(
  items: ScheduleItemCollection<T>,
  options: FilterOptions,
  now: Date,
  selections?: Selections,
): ScheduleItemCollection<T> => {
  const { disabledTags, text, showPastEvents, onlyBookmarked } = options
  const byBookmarked = useMemo(() => {
    if (onlyBookmarked) {
      return makeScheduleItemCollection(
        selections ? items.filter(makeBookmarkFilter(selections)) : [],
      )
    } else {
      return items
    }
  }, [onlyBookmarked, items, selections])
  const byTag = useMemo(
    () =>
      disabledTags
        ? makeScheduleItemCollection(
            byBookmarked.filter(makeTagFilter(disabledTags)),
          )
        : byBookmarked,
    [byBookmarked, disabledTags],
  )
  const byPast = useMemo(
    () =>
      !showPastEvents
        ? makeScheduleItemCollection(byTag.filter(makePastItemFilter(now)))
        : byTag,
    [showPastEvents, byTag, now],
  )
  const byTitle = useMemo(
    () =>
      text
        ? makeScheduleItemCollection(byPast.filter(makeTitleFilter(text)))
        : byPast,
    [text, byPast],
  )

  return byTitle
}

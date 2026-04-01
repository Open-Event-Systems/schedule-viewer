import {
  makeBookmarkFilter,
  makePastItemFilter,
  makeScheduleItemCollection,
  makeTagFilter,
  makeTitleFilter,
  type DetailedScheduleItem,
  type ScheduleItemCollection,
} from "@open-event-systems/schedule-lib"
import { useMemo } from "react"

export type FilterOptions = Readonly<{
  disabledTags?: Iterable<string>
  text?: string
  showPastEvents?: boolean
  onlyBookmarked?: boolean
  now?: Date
  selections?: Iterable<string>
}>

export const useFilteredItems = <T extends DetailedScheduleItem>(
  items: ScheduleItemCollection<T>,
  options?: FilterOptions,
): ScheduleItemCollection<T> => {
  const {
    disabledTags,
    text,
    showPastEvents,
    onlyBookmarked,
    now,
    selections,
  } = options ?? {}
  const byBookmarked = useMemo(() => {
    if (onlyBookmarked) {
      return makeScheduleItemCollection(
        selections ? items.filter(makeBookmarkFilter(selections)) : [],
      )
    } else {
      return items ?? makeScheduleItemCollection()
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
        ? makeScheduleItemCollection(
            byTag.filter(makePastItemFilter(now ?? new Date())),
          )
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

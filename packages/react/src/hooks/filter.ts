import {
  makeBookmarkFilter,
  makePastItemFilter,
  makeTagFilter,
  makeTitleFilter,
  type DetailedScheduleItem,
} from "@open-event-systems/schedule-lib"
import { useMemo } from "react"
import { iterToArr } from "../utils.js"

export type FilterOptions = Readonly<{
  disabledTags?: Iterable<string>
  text?: string
  showPastEvents?: boolean
  onlyBookmarked?: boolean
  now?: Date
  selections?: Iterable<string>
}>

export const useFilteredItems = <T extends DetailedScheduleItem>(
  items?: Iterable<T>,
  options?: FilterOptions,
): Iterable<T> => {
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
      return iterToArr(items).filter(makeBookmarkFilter(selections))
    } else {
      return items
    }
  }, [onlyBookmarked, items, selections])
  const byTag = useMemo(
    () =>
      disabledTags
        ? iterToArr(byBookmarked).filter(makeTagFilter(disabledTags))
        : byBookmarked,
    [byBookmarked, disabledTags],
  )
  const byPast = useMemo(
    () =>
      !showPastEvents
        ? iterToArr(byTag).filter(makePastItemFilter(now ?? new Date()))
        : byTag,
    [showPastEvents, byTag, now],
  )
  const byTitle = useMemo(
    () => (text ? iterToArr(byPast).filter(makeTitleFilter(text)) : byPast),
    [text, byPast],
  )

  return iterToArr(byTitle)
}

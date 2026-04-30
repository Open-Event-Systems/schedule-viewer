import {
  iterToArr,
  makeBookmarkFilter,
  makePastItemFilter,
  makeTagFilter,
  makeTitleFilter,
  makeUnvisitedFilter,
  type DetailedScheduleItem,
} from "@open-event-systems/schedule-lib"
import { useMemo } from "react"
import type { SelectionsFilterOption } from "../components/index.js"

export type FilterOptions = Readonly<{
  disabledTags?: Iterable<string> | null
  text?: string | null
  showPastEvents?: boolean | null
  selectionsFilterOptions?: Iterable<SelectionsFilterOption> | null
  now?: Date | null
  bookmarked?: Iterable<string> | null
  visited?: Iterable<string> | null
}>

export const filterItems = <T extends DetailedScheduleItem>(
  items?: Iterable<T>,
  options?: FilterOptions,
): Iterable<T> => {
  const {
    disabledTags,
    text,
    showPastEvents,
    selectionsFilterOptions,
    now,
    bookmarked,
    visited,
  } = options ?? {}

  const optsArr = iterToArr(selectionsFilterOptions)

  let res = items

  if (optsArr.includes("bookmarked")) {
    res = iterToArr(res).filter(makeBookmarkFilter(bookmarked))
  }

  if (optsArr.includes("unvisited")) {
    res = iterToArr(res).filter(makeUnvisitedFilter(visited))
  }

  if (disabledTags) {
    res = iterToArr(res).filter(makeTagFilter(disabledTags))
  }

  if (!showPastEvents) {
    res = iterToArr(res).filter(makePastItemFilter(now ?? new Date()))
  }

  if (text) {
    res = iterToArr(res).filter(makeTitleFilter(text))
  }

  return iterToArr(res)
}

export const useFilteredItems = <T extends DetailedScheduleItem>(
  items?: Iterable<T>,
  options?: FilterOptions,
): Iterable<T> => {
  const {
    disabledTags,
    text,
    showPastEvents,
    selectionsFilterOptions,
    now,
    bookmarked,
    visited,
  } = options ?? {}
  const bySelections = useMemo(() => {
    const optsArr = iterToArr(selectionsFilterOptions)
    let res = items

    if (optsArr.includes("bookmarked")) {
      res = iterToArr(res).filter(makeBookmarkFilter(bookmarked))
    }

    if (optsArr.includes("unvisited")) {
      res = iterToArr(res).filter(makeUnvisitedFilter(visited))
    }

    return res
  }, [selectionsFilterOptions, items, bookmarked, visited])
  const byTag = useMemo(
    () =>
      disabledTags
        ? iterToArr(bySelections).filter(makeTagFilter(disabledTags))
        : bySelections,
    [bySelections, disabledTags],
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

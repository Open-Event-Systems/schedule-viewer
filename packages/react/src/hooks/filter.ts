import {
  iterToArr,
  makeNameFilter,
  makePastItemFilter,
  makeSelectionsFilter,
  makeTagFilter,
  type ScheduleItem,
} from "@open-event-systems/schedule-lib"
import { useMemo } from "react"
import type { SelectionsFilterOption } from "../components/index.js"
import type { Dayjs } from "dayjs"
import dayjs from "dayjs"

export type FilterOptions = Readonly<{
  disabledTags?: Iterable<string> | undefined | null
  text?: string | undefined | null
  showPastEvents?: boolean | undefined | null
  selectionsFilterOptions?: Iterable<SelectionsFilterOption> | undefined | null
  now?: Dayjs | undefined | null
  bookmarked?: Iterable<string> | undefined | null
  visited?: Iterable<string> | undefined | null
}>

export const filterItems = <T extends ScheduleItem>(
  items?: Iterable<T> | null,
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
    res = iterToArr(res).filter(makeSelectionsFilter("include", bookmarked))
  }

  if (optsArr.includes("unvisited")) {
    res = iterToArr(res).filter(makeSelectionsFilter("exclude", visited))
  }

  if (disabledTags) {
    const tagFilter = makeTagFilter("exclude", disabledTags)
    res = iterToArr(res).filter((it) => !("keywords" in it) || tagFilter(it))
  }

  if (!showPastEvents) {
    const pastFilter = makePastItemFilter(now ?? dayjs())
    res = iterToArr(res).filter((it) => !("startDate" in it) || pastFilter(it))
  }

  if (text) {
    res = iterToArr(res).filter(makeNameFilter(text))
  }

  return iterToArr(res)
}

export const useFilteredItems = <T extends ScheduleItem>(
  items?: Iterable<T> | null,
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
      res = iterToArr(res).filter(makeSelectionsFilter("include", bookmarked))
    }

    if (optsArr.includes("unvisited")) {
      res = iterToArr(res).filter(makeSelectionsFilter("exclude", visited))
    }

    return res
  }, [selectionsFilterOptions, items, bookmarked, visited])
  const byTag = useMemo(() => {
    const tagFilter = makeTagFilter("exclude", disabledTags)
    return disabledTags
      ? iterToArr(bySelections).filter(
          (it) => !("keywords" in it) || tagFilter(it),
        )
      : bySelections
  }, [bySelections, disabledTags])
  const byPast = useMemo(() => {
    const pastFilter = makePastItemFilter(now ?? dayjs())
    return !showPastEvents
      ? iterToArr(byTag).filter((it) => !("startDate" in it) || pastFilter(it))
      : byTag
  }, [showPastEvents, byTag, now])
  const byName = useMemo(
    () => (text ? iterToArr(byPast).filter(makeNameFilter(text)) : byPast),
    [text, byPast],
  )

  return iterToArr(byName)
}

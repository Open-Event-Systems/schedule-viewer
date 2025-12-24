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
  disabledTags?: Iterable<string>
  text?: string
  showPastEvents?: boolean
  onlyBookmarked?: boolean
}>

export type FilterCallbacks = Readonly<{
  onChangeTags?: (tags: Set<string>) => void
  onChangeText?: (text: string) => void
  onChangeShowPastEvents?: (showPastEvents: boolean) => void
  onChangeOnlyBookmarked?: (onlyBookmarked?: boolean) => void
}>

export const FilterContext = createContext<FilterSettings & FilterCallbacks>({})

export const useNewFilterContext = (): FilterSettings & FilterCallbacks => {
  const reducer = (
    cur: FilterSettings,
    action: FilterSettings,
  ): FilterSettings => ({ ...cur, ...action })

  const [state, dispatch] = useReducer(reducer, {})

  const callbacks = useMemo<FilterCallbacks>(() => {
    return {
      onChangeShowPastEvents(show) {
        dispatch({ showPastEvents: show })
      },
      onChangeTags(tags) {
        dispatch({ disabledTags: tags })
      },
      onChangeText(text) {
        dispatch({ text })
      },
      onChangeOnlyBookmarked(onlyBookmarked) {
        dispatch({ onlyBookmarked })
      },
    }
  }, [dispatch])

  return { ...state, ...callbacks }
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
  const filter = useContext(FilterContext)
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

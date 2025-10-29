import { FilterContext } from "@open-event-systems/schedule-react"
import {
  Filter as BaseFilter,
  type FilterProps,
} from "@open-event-systems/schedule-react/components/filter/filter"
import { useCallback, useContext } from "react"

export const Filter = (props: FilterProps) => {
  const [filter, updateFilter] = useContext(FilterContext)

  const { disabledTags, text, showPast } = filter

  return (
    <BaseFilter
      {...props}
      disabledTags={disabledTags}
      text={text}
      showPastEvents={showPast}
      onChangeTags={useCallback((tags: Set<string>) => {
        updateFilter({ disabledTags: tags })
      }, [])}
      onChangeText={useCallback((text: string) => {
        updateFilter({ text })
      }, [])}
      onChangeShowPastEvents={useCallback((show: boolean) => {
        updateFilter({ showPast: show })
      }, [])}
    />
  )
}

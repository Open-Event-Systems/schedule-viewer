import { ScheduleItemStore } from "@open-event-systems/schedule-lib"
import {
  useFilteredItems,
  useScheduleConfig,
  useSelections,
} from "@open-event-systems/schedule-react"
import {
  binItemsByTag,
  ItemPills,
} from "@open-event-systems/schedule-react/components/pills/item-pills"
import { useMemo } from "react"
import { useTime } from "../../config.js"
import { Text } from "@mantine/core"

export type TagsViewProps = {
  items: ScheduleItemStore
}

export const TagsView = (props: TagsViewProps) => {
  const { items } = props
  const now = useTime()
  const selections = useSelections()
  const filtered = useFilteredItems(items, now, selections)
  const config = useScheduleConfig()
  const bins = useMemo(() => binItemsByTag(filtered, config.tags), [filtered])

  if (filtered.size > 0) {
    return <ItemPills bins={bins} />
  } else {
    return (
      <Text c="dimmed" ta="center">
        No events
      </Text>
    )
  }
}

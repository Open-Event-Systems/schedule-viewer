import { ScheduleItemStore } from "@open-event-systems/schedule-lib"
import {
  useFilteredItems,
  useSelections,
} from "@open-event-systems/schedule-react"
import {
  binItemsByTitle,
  ItemPills,
} from "@open-event-systems/schedule-react/components/pills/item-pills"
import { useMemo } from "react"
import { useTime } from "../../config.js"
import { Text } from "@mantine/core"

export type CatalogViewProps = {
  items: ScheduleItemStore
}

export const CatalogView = (props: CatalogViewProps) => {
  const { items } = props
  const now = useTime()
  const selections = useSelections()
  const filtered = useFilteredItems(items, now, selections)
  const bins = useMemo(() => binItemsByTitle(filtered), [filtered])

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

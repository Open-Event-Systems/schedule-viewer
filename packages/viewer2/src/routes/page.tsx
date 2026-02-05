import {
  SchedulePage,
  selectionsQueryFns,
  selectionsQueryKeys,
  useFilteredItems,
  useItems,
  useRelevantTags,
  useScheduleConfig,
  useSelectionsAPI,
  type ScheduleType,
} from "@open-event-systems/schedule-react"
import { parsers, useRenderPillFunc } from "../schedule.js"
import { useViewerConfig } from "../config.js"
import { useLocation, useNavigate } from "@tanstack/react-router"
import type { Day } from "@open-event-systems/schedule-lib"
import { useSuspenseQuery } from "@tanstack/react-query"

declare module "@tanstack/react-router" {
  interface HistoryState {
    selectedDayKey?: string
    scheduleViewType?: ScheduleType
  }
}

export const PageRoute = () => {
  const { event: items } = useItems(parsers)
  const { tags } = useViewerConfig()

  const navigate = useNavigate()
  const loc = useLocation()
  const { selectedDayKey, scheduleViewType } = loc.state

  const setSelectedDay = (day: Day) => {
    navigate({
      state: {
        ...loc.state,
        selectedDayKey: day.key,
      },
      replace: true,
    })
  }

  const setViewType = (type?: ScheduleType) => {
    navigate({
      state: {
        ...loc.state,
        ...(type && { scheduleViewType: type }),
      },
      replace: true,
    })
  }

  const relevantTags = useRelevantTags(tags, items)

  const config = useScheduleConfig()
  const api = useSelectionsAPI()
  const query = useSuspenseQuery({
    queryKey: selectionsQueryKeys.sessionSelections(config.id, "bookmarks"),
    queryFn: selectionsQueryFns.sessionSelections(api, "bookmarks"),
    staleTime: 120000,
    subscribed: false,
  })
  const ssels = query.data

  const renderPill = useRenderPillFunc()

  const now = new Date()
  const filteredItems = useFilteredItems(items, now, ssels.selections)

  return (
    <SchedulePage
      items={items}
      filteredItems={filteredItems}
      renderPill={renderPill}
      tags={relevantTags}
      selectedDayKey={selectedDayKey}
      type={scheduleViewType}
      onChangeType={setViewType}
      onSelectDay={setSelectedDay}
    />
  )
}

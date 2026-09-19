import { useAppContext } from "#src/app.js"
import {
  PastEventsFilterContainer,
  SelectionsFilterContainer,
  TagFilterContainer,
  TextFilterContainer,
  ViewSelectContainer,
} from "#src/components/filter-state/filter-state.js"
import { useFilterDialogOpenState } from "#src/hooks/filter-dialog.js"
import {
  LocationFilterActionsContext,
  useMakeLocationFilterActions,
  useSyncFilterDialogState,
} from "#src/hooks/filter-location-state.js"
import { useScheduleData } from "#src/hooks/schedule.js"
import { useNow } from "#src/hooks/time.js"
import {
  useFilterCount,
  useFilteredItemOccurrences,
  useOccurrences,
  useSchedulePageData,
  useViewSelect,
} from "#src/router/components/schedule-page/hooks.js"
import { getDays, type Day } from "@open-event-systems/schedule-lib"
import {
  FilterStoreContext,
  ScheduleDataContext,
  SchedulePage,
  ScheduleView,
  ShareMenu,
  useCreateFilterStore,
  useRelevantTags,
  type ViewSelectProps,
} from "@open-event-systems/schedule-react"
import { getRouteApi } from "@tanstack/react-router"
import { useCallback, useMemo } from "react"

const routeApi = getRouteApi(
  "/loading/schedule/schedulePageData/$pageId/{-$viewType}/{-$day}",
)

export const SchedulePageRoute = () => {
  const locationFilterActions = useMakeLocationFilterActions()
  const filterStore = useCreateFilterStore()

  return (
    <LocationFilterActionsContext.Provider value={locationFilterActions}>
      <FilterStoreContext.Provider value={filterStore}>
        <SchedulePageContainer />
      </FilterStoreContext.Provider>
    </LocationFilterActionsContext.Provider>
  )
}

export const SchedulePageContainer = () => {
  const [filterDialogOpen, setFilterDialogOpen] = useFilterDialogOpenState()
  const { config } = useAppContext()
  const { pageId, day } = routeApi.useParams()
  const { pageConfig, viewConfig } = routeApi.useLoaderData()
  const now = useNow()

  const openFilterDialog = useCallback(
    () => setFilterDialogOpen(true),
    [setFilterDialogOpen],
  )
  const closeFilterDialog = useCallback(
    () => setFilterDialogOpen(false),
    [setFilterDialogOpen],
  )

  useSyncFilterDialogState(filterDialogOpen)

  const scheduleData = useScheduleData()

  const items = useSchedulePageData(pageConfig)
  const relevantTags = useRelevantTags(items)

  const occurrences = useOccurrences(items)

  const days = useMemo(
    () => getDays(occurrences, config.dayChangeHour),
    [occurrences, config.dayChangeHour],
  )

  const filteredOccurrences = useFilteredItemOccurrences(occurrences)
  const navigate = routeApi.useNavigate()

  const { options: viewSelectOptions, setViewType } = useViewSelect(
    pageConfig,
    days,
    now,
  )

  const filterCount = useFilterCount(viewConfig)

  const renderViewSelect = useCallback(
    (props: ViewSelectProps) => {
      return (
        <ViewSelectContainer
          {...props}
          onChange={setViewType}
          value={viewConfig.id}
        />
      )
    },
    [viewConfig.id, setViewType],
  )

  const onSetDay = useCallback(
    (day: Day) => {
      navigate({
        to: "/$pageId/{-$viewType}/{-$day}",
        params: (prev) => ({
          ...prev,
          pageId,
          viewType: viewConfig.id,
          day: day.key,
        }),
        search: true,
        state: true,
        hash: true,
        replace: true,
      })
    },
    [navigate, pageId, viewConfig.id],
  )

  return (
    <ScheduleDataContext.Provider value={scheduleData}>
      <SchedulePage
        filterDialogOpen={filterDialogOpen}
        onOpenFilterDialog={openFilterDialog}
        onCloseFilterDialog={closeFilterDialog}
        viewSelectOptions={viewSelectOptions}
        enabledFeatures={viewConfig.features}
        tags={relevantTags}
        renderSelectionsFilter={(props) => (
          <SelectionsFilterContainer {...props} />
        )}
        textFilter={<TextFilterContainer />}
        pastEventsFilter={<PastEventsFilterContainer />}
        renderTagFilter={(props) => <TagFilterContainer {...props} />}
        renderViewSelect={renderViewSelect}
        renderShareMenu={(props) => <ShareMenu {...props} />}
        filterCount={filterCount}
      >
        <ScheduleView
          type={viewConfig.type}
          now={now}
          byDay={viewConfig.byDay}
          config={viewConfig}
          days={days}
          items={filteredOccurrences}
          onSelectDay={onSetDay}
          selectedDay={day}
        />
      </SchedulePage>
    </ScheduleDataContext.Provider>
  )
}

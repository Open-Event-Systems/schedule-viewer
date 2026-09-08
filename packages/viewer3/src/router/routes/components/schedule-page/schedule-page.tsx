import { SchedulePage } from "@open-event-systems/schedule-react"
import {
  PastEventsFilterContainer,
  SelectionsFilterContainer,
  TagFilterContainer,
  TextFilterContainer,
} from "../../../../components/filter-state/filter-state.js"
import { useLocation, useNavigate, useRouter } from "@tanstack/react-router"
import { useCallback, useLayoutEffect, useRef } from "react"
import {
  FilterDialogStoreContext,
  useCreateFilterDialogStore,
} from "../../../../hooks/filter.js"
import { useStore } from "zustand"
import { useShallow } from "zustand/shallow"

export const SchedulePageRoute = () => {
  const filterDialogStore = useCreateFilterDialogStore()

  const filterDialogOpen = useLocation({
    select: ({ state }) => state.filterDialogOpen,
  })

  const navigate = useNavigate()

  const openFilterDialog = useCallback(
    () =>
      navigate({
        to: ".",
        state: (prev) => ({ ...prev, filterDialogOpen: true }),
        search: true,
        hash: true,
      }),
    [navigate],
  )

  const router = useRouter()

  const closeFilterDialog = useCallback(() => router.history.go(-1), [router])

  const storeState = useStore(
    filterDialogStore,
    useShallow((state) => ({
      search: state.search,
      past: state.past,
      tagFilterMode: state.tagFilterMode,
      disabledTags: state.disabledTags,
    })),
  )

  const prevDialogOpen = useRef(filterDialogOpen)

  useLayoutEffect(() => {
    if (!filterDialogOpen && prevDialogOpen.current) {
      navigate({
        to: ".",
        state: (prev) => ({
          ...prev,
          disabledTags: [...(storeState.disabledTags ?? [])],
          tagFilterMode: storeState.tagFilterMode,
        }),
        search: (prev) => ({
          ...prev,
          search: storeState.search,
          past: storeState.past,
        }),
        hash: true,
        replace: true,
      })
    }

    prevDialogOpen.current = filterDialogOpen
  }, [navigate, filterDialogOpen, storeState])

  return (
    <FilterDialogStoreContext.Provider value={filterDialogStore}>
      <SchedulePage
        filterDialogOpen={!!filterDialogOpen}
        onOpenFilterDialog={openFilterDialog}
        onCloseFilterDialog={closeFilterDialog}
        enabledFeatures={[
          "bookmarked-filter",
          "unvisited-filter",
          "search",
          "past-events-filter",
          "tag-filter",
          "export",
          "share",
          "sync",
        ]}
        tags={[
          {
            value: "main-event",
            label: "Main Event",
          },
          {
            value: "photography",
            label: "Photography",
          },
        ]}
        renderSelectionsFilter={(props) => (
          <SelectionsFilterContainer {...props} />
        )}
        textFilter={<TextFilterContainer dialog={filterDialogOpen} />}
        pastEventsFilter={
          <PastEventsFilterContainer dialog={filterDialogOpen} />
        }
        renderTagFilter={(props) => (
          <TagFilterContainer {...props} dialog={filterDialogOpen} />
        )}
      />
    </FilterDialogStoreContext.Provider>
  )
}

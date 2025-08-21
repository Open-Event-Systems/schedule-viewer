import {
  BookmarkAPI,
  EventAPI,
  EventStore,
  makeEvent,
  makeEventAPI,
  Selections,
} from "@open-event-systems/schedule-lib"
import { ScheduleConfig, useScheduleConfig } from "./config/config.js"
import { createContext, useContext } from "react"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query"
import { useBookmarkAPI } from "./bookmarks.js"

export const EventAPIContext = createContext<EventAPI>(makeEventAPI(""))
export const EventAPIProvider = EventAPIContext.Provider
export const useEventAPI = (): EventAPI => useContext(EventAPIContext)

export const getEventsQueryOptions = (
  config: ScheduleConfig,
  api: EventAPI,
): UseSuspenseQueryOptions<EventStore> => ({
  queryKey: ["schedule", config.id, "events"],
  async queryFn() {
    if (Array.isArray(config.events)) {
      const events = config.events.map((data) => makeEvent(data))
      return new EventStore(events)
    } else {
      const res = await api.getEvents()
      return new EventStore(res)
    }
  },
  staleTime: 300000,
})

export const useEvents = (): EventStore => {
  const config = useScheduleConfig()
  const api = useEventAPI()
  const res = useSuspenseQuery(getEventsQueryOptions(config, api))
  return res.data
}

export const getSelectionsQueryOptions = (
  config: ScheduleConfig,
  bookmarkAPI: BookmarkAPI,
): UseSuspenseQueryOptions<Selections> => ({
  queryKey: ["schedule", config.id, "bookmarks"],
  async queryFn() {
    return await bookmarkAPI.getSessionSelections()
  },
  staleTime: 120000,
})

export const useSelections = (): Selections => {
  const config = useScheduleConfig()
  const bookmarkAPI = useBookmarkAPI()
  const res = useSuspenseQuery(getSelectionsQueryOptions(config, bookmarkAPI))
  return res.data
}

export const useSetSelections = (): ((
  selections: Selections,
) => Promise<Selections>) => {
  const config = useScheduleConfig()
  const queryClient = useQueryClient()
  const api = useBookmarkAPI()
  const mutation = useMutation({
    mutationKey: ["schedule", config.id, "bookmarks"],
    async mutationFn(selections: Selections) {
      return await api.setSessionSelections(selections)
    },
    onSuccess(data) {
      queryClient.setQueryData(
        getSelectionsQueryOptions(config, api).queryKey,
        data,
      )
    },
  })

  return mutation.mutateAsync
}

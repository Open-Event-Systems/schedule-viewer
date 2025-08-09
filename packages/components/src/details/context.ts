import { Event } from "@open-event-systems/schedule-lib"
import { createContext, MouseEvent, useContext } from "react"

export type EventDetailsContextType = Readonly<{
  getHref?: (event: Event) => string | undefined
  onClickEvent?: (e: MouseEvent, event: Event) => void
  getIsBookmarked?: (event: Event) => boolean
  setBookmarked?: (event: Event, set: boolean) => void
  getBookmarkCount?: (event: Event) => number | undefined
  getLocationHref?: (event: Event) => string | undefined
  onClickLocation?: (event: Event) => void
}>

export const EventDetailsContext = createContext<EventDetailsContextType>({})

export const EventDetailsProvider = EventDetailsContext.Provider
export const useEventDetails = (): EventDetailsContextType =>
  useContext(EventDetailsContext)

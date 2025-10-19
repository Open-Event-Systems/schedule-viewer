import { ScheduleItem } from "@open-event-systems/schedule-lib"
import { createContext, MouseEvent, useContext } from "react"
import { ItemDetailsProps } from "./item-details.js"
import { TagEntry } from "../../config/config.js"

export type EventDetailsFuncReturn = Partial<ItemDetailsProps> & {
  onClickEvent?: (e: MouseEvent) => void
}

export const EventDetailsContext = createContext<
  ((event: ScheduleItem) => EventDetailsFuncReturn) | undefined
>(undefined)
export const EventDetailsProvider = EventDetailsContext.Provider
export const useEventDetails = ():
  | ((event: ScheduleItem) => EventDetailsFuncReturn)
  | undefined => useContext(EventDetailsContext)

export const makeEventDetailsFunc = ({
  getHref,
  onClickEvent,
  getIsBookmarked,
  setBookmarked,
  getBookmarkCount,
  getLocationHref,
  onClickLocation,
  tags,
}: {
  getHref?: (event: ScheduleItem) => string | undefined
  onClickEvent?: (e: MouseEvent, event: ScheduleItem) => void
  getIsBookmarked?: (event: ScheduleItem) => boolean | undefined
  setBookmarked?: (event: ScheduleItem, set: boolean) => void
  getBookmarkCount?: (event: ScheduleItem) => number | undefined
  getLocationHref?: (event: ScheduleItem) => string | undefined
  onClickLocation?: (e: MouseEvent, event: ScheduleItem) => void
  tags?: readonly TagEntry[]
}): ((event: ScheduleItem) => EventDetailsFuncReturn) => {
  return (event) => {
    const props: EventDetailsFuncReturn = {}

    if (getHref) {
      props.url = getHref(event)
    }

    if (onClickEvent) {
      props.onClickEvent = (e) => onClickEvent(e, event)
    }

    if (getIsBookmarked) {
      props.bookmarked = getIsBookmarked(event)
    }

    if (setBookmarked) {
      props.setBookmarked = (set) => setBookmarked(event, set)
    }

    if (getBookmarkCount) {
      props.bookmarkCount = getBookmarkCount(event)
    }

    if (getLocationHref) {
      props.locationHref = getLocationHref(event)
    }

    if (onClickLocation) {
      props.onClickLocation = (e) => onClickLocation(e, event)
    }

    if (tags) {
      props.tags = tags
    }

    return props
  }
}

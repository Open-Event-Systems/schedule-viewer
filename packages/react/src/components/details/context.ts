import { ScheduleItem } from "@open-event-systems/schedule-lib"
import { createContext, MouseEvent, useContext } from "react"
import { ItemDetailsProps } from "./item-details.js"
import { TagEntry } from "../../config/config.js"

export type ItemDetailsFuncReturn = Partial<ItemDetailsProps> & {
  onClickItem?: (e: MouseEvent) => void
}

export const ItemDetailsContext = createContext<
  ((item: ScheduleItem) => ItemDetailsFuncReturn) | undefined
>(undefined)
export const ItemDetailsProvider = ItemDetailsContext.Provider
export const useItemDetails = ():
  | ((item: ScheduleItem) => ItemDetailsFuncReturn)
  | undefined => useContext(ItemDetailsContext)

export const makeItemDetailsFunc = ({
  getHref,
  onClickItem,
  getIsBookmarked,
  setBookmarked,
  getBookmarkCount,
  getLocationHref,
  onClickLocation,
  tags,
}: {
  getHref?: (item: ScheduleItem) => string | undefined
  onClickItem?: (e: MouseEvent, item: ScheduleItem) => void
  getIsBookmarked?: (item: ScheduleItem) => boolean | undefined
  setBookmarked?: (item: ScheduleItem, set: boolean) => void
  getBookmarkCount?: (item: ScheduleItem) => number | undefined
  getLocationHref?: (item: ScheduleItem) => string | undefined
  onClickLocation?: (e: MouseEvent, item: ScheduleItem) => void
  tags?: readonly TagEntry[]
}): ((item: ScheduleItem) => ItemDetailsFuncReturn) => {
  return (item) => {
    const props: ItemDetailsFuncReturn = {}

    if (getHref) {
      props.url = getHref(item)
    }

    if (onClickItem) {
      props.onClickItem = (e) => onClickItem(e, item)
    }

    if (getIsBookmarked) {
      props.bookmarked = getIsBookmarked(item)
    }

    if (setBookmarked) {
      props.setBookmarked = (set) => setBookmarked(item, set)
    }

    if (getBookmarkCount) {
      props.bookmarkCount = getBookmarkCount(item)
    }

    if (getLocationHref) {
      props.locationHref = getLocationHref(item)
    }

    if (onClickLocation) {
      props.onClickLocation = (e) => onClickLocation(e, item)
    }

    if (tags) {
      props.tags = tags
    }

    return props
  }
}

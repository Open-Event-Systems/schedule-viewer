import { createContext, type MouseEvent, useContext } from "react"
import type { ItemDetailsItemType, ItemDetailsProps } from "./item-details.js"
import type { TagEntry } from "../../config/config.js"
import type { ScheduleItem } from "@open-event-systems/schedule-lib"

export type GetItemDetailsFunc = (item: ScheduleItem) => Readonly<
  Partial<ItemDetailsProps> & {
    onClickItem?: (e: MouseEvent) => void
  }
>

export const ItemDetailsContext = createContext<GetItemDetailsFunc>(() => ({}))
export const useItemDetailsFunc = (): GetItemDetailsFunc =>
  useContext(ItemDetailsContext)

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
  getHref?: (item: ItemDetailsItemType) => string | undefined
  onClickItem?: (e: MouseEvent, item: ItemDetailsItemType) => void
  getIsBookmarked?: (item: ItemDetailsItemType) => boolean | undefined
  setBookmarked?: (item: ItemDetailsItemType, set: boolean) => void
  getBookmarkCount?: (item: ItemDetailsItemType) => number | undefined
  getLocationHref?: (item: ItemDetailsItemType) => string | undefined
  onClickLocation?: (e: MouseEvent, item: ItemDetailsItemType) => void
  tags?: readonly TagEntry[]
}): GetItemDetailsFunc => {
  return (item) => {
    const props: Partial<
      ItemDetailsProps & { onClickItem?: (e: MouseEvent) => void }
    > = {}

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

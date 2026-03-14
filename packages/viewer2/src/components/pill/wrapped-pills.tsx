import {
  ItemDetails,
  ItemPills,
  useBookmarkCount,
  useIsSelected,
  useSetSelected,
  type ItemDetailsProps,
  type ItemPillProps,
} from "@open-event-systems/schedule-react"
import { useViewerConfig } from "../../config.js"
import { useMemo } from "react"

export const WrappedItemPill = (
  props: ItemPillProps & {
    tagIndicatorFunc: (tags: Iterable<string>) => string | undefined
  },
) => {
  const { tagIndicatorFunc, ...other } = props
  const config = useViewerConfig()
  const indicator = useMemo(
    () => tagIndicatorFunc(props.item.tags ?? []),
    [props.item.tags, tagIndicatorFunc],
  )
  return <ItemPills.Pill {...other} tags={config.tags} indicator={indicator} />
}

export const WrappedItemDetails = (props: ItemDetailsProps) => {
  const { ...other } = props

  const config = useViewerConfig()
  const bookmarked = useIsSelected("bookmarks", props.item.id)
  const count = useBookmarkCount(props.item.id)
  const setBookmarked = useSetSelected("bookmarks", props.item.id)

  return (
    <ItemDetails
      {...other}
      bookmarked={bookmarked}
      setBookmarked={setBookmarked}
      bookmarkCount={count}
      tags={config.tags}
    />
  )
}

import {
  ItemDetails,
  ItemPills,
  useIsSelected,
  useSelectionCount,
  useSetSelected,
  type ItemDetailsProps,
  type ItemPillProps,
} from "@open-event-systems/schedule-react"
import { useViewerConfig } from "../../config.js"
import { useCallback, useMemo, type AllHTMLAttributes } from "react"

export const WrappedItemPill = (
  props: ItemPillProps & {
    tagIndicatorFunc: (tags: Iterable<string>) => string | undefined
    href?: string
  },
) => {
  const { tagIndicatorFunc, href, ...other } = props
  const config = useViewerConfig()
  const indicator = useMemo(
    () => tagIndicatorFunc(props.item.tags ?? []),
    [props.item.tags, tagIndicatorFunc],
  )

  const renderBody = useCallback(
    (props: AllHTMLAttributes<HTMLElement>) => <a href={href} {...props} />,
    [href],
  )

  return (
    <ItemPills.Pill
      {...other}
      tags={config.tags}
      indicator={indicator}
      renderBody={renderBody}
    />
  )
}

export const WrappedItemDetails = (props: ItemDetailsProps) => {
  const { ...other } = props

  const config = useViewerConfig()
  const { data: bookmarked } = useIsSelected("bookmarks", props.item.id)
  const { data: count } = useSelectionCount("bookmarks", props.item.id)
  const setBookmarked = useSetSelected("bookmarks")
  const wrappedSetBookmarked = useCallback(
    (bookmarked: boolean) => {
      return setBookmarked(props.item.id, bookmarked)
    },
    [setBookmarked, props.item.id],
  )

  return (
    <ItemDetails
      {...other}
      bookmarked={bookmarked}
      setBookmarked={wrappedSetBookmarked}
      bookmarkCount={count}
      tags={config.tags}
    />
  )
}

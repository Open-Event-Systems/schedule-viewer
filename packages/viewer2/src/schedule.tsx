import {
  parseMapFlag,
  parseScheduleEvent,
  parseVendor,
} from "@open-event-systems/schedule-lib"
import {
  ItemDetails,
  useIsSelected,
  useSetSelected,
  type ItemDetailsProps,
} from "@open-event-systems/schedule-react"
import { memo, type ReactNode } from "react"
import {
  ItemPill,
  type ItemPillProps,
} from "../../react/src/components/pill/item-pill.js"
import { useRouter } from "@tanstack/react-router"
import { defaultPageRoute } from "./routes.js"
import { useViewerConfig } from "./config.js"

export const parsers = {
  event: parseScheduleEvent,
  vendor: parseVendor,
  "map-flag": parseMapFlag,
} as const

const WrappedItemDetails = memo((props: ItemDetailsProps) => {
  const {
    item: { id },
  } = props
  const router = useRouter()
  const url = router.buildLocation({
    to: defaultPageRoute.to,
  }).url

  const config = useViewerConfig()

  const isBookmarked = useIsSelected("bookmarks", id)
  const setBookmarked = useSetSelected("bookmarks", id)

  return (
    <ItemDetails
      {...props}
      url={url}
      tags={config.tags}
      bookmarked={isBookmarked}
      setBookmarked={setBookmarked}
    />
  )
})

WrappedItemDetails.displayName = "WrappedItemDetails"

export const makeRenderItemDetailsFunc = (): ((
  props: ItemDetailsProps,
) => ReactNode) => {
  const render = (props: ItemDetailsProps) => {
    return <WrappedItemDetails key={props.item.id} {...props} />
  }

  return render
}

export const useRenderItemDetailsFunc = (): ((
  props: ItemDetailsProps,
) => ReactNode) => {
  return makeRenderItemDetailsFunc()
}

const WrappedItemPill = memo((props: ItemPillProps) => {
  const router = useRouter()
  const url = router.buildLocation({
    to: defaultPageRoute.to,
  }).url

  return (
    <ItemPill
      {...props}
      href={url}
      onClick={(e) => {
        e.preventDefault()
        router.navigate({
          to: defaultPageRoute.to,
        })
      }}
    />
  )
})

WrappedItemPill.displayName = "WrappedItemPill"

export const makeRenderPillFunc = (
  renderItemDetailsFunc: (props: ItemDetailsProps) => ReactNode,
): ((props: ItemPillProps) => ReactNode) => {
  const render = (props: ItemPillProps) => {
    return (
      <WrappedItemPill
        key={props.item.id}
        {...props}
        ItemHoverCardProps={{
          ...props.ItemHoverCardProps,
          renderItemDetails: renderItemDetailsFunc,
        }}
      />
    )
  }

  return render
}

export const useRenderPillFunc = (): ((props: ItemPillProps) => ReactNode) => {
  const renderItemDetails = useRenderItemDetailsFunc()
  return makeRenderPillFunc(renderItemDetails)
}

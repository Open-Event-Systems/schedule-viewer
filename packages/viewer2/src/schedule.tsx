import {
  parseMapFlag,
  parseScheduleEvent,
  parseVendor,
} from "@open-event-systems/schedule-lib"
import {
  ItemDetails,
  makeTagIndicatorFunc,
  useIsSelected,
  useSetSelected,
  type ItemDetailsItemType,
  type ItemDetailsProps,
  type TagIndicatorEntry,
} from "@open-event-systems/schedule-react"
import {
  createContext,
  memo,
  use,
  type MouseEvent,
  type ReactNode,
} from "react"
import {
  ItemPill,
  type ItemPillProps,
} from "../../react/src/components/pill/item-pill.js"
import { eventDetailsRoute, mapRoute } from "./routes.js"
import { useViewerConfig } from "./config.js"
import type { makeRouter } from "./router.js"
import {
  makeMapLocationMatchFunc,
  type MapLocation,
} from "@open-event-systems/schedule-map"

export const parsers = {
  event: parseScheduleEvent,
  vendor: parseVendor,
  "map-flag": parseMapFlag,
} as const

export type CachedItemProps = {
  url?: string
  onClick?: (e: MouseEvent) => void
  indicator?: string
  mapURL?: string
  onClickLocation?: (e: MouseEvent) => void
}

export const makeCachedItemPropsMap = (
  router: ReturnType<typeof makeRouter>,
  items: Iterable<ItemDetailsItemType>,
  tagIndicators: Iterable<TagIndicatorEntry>,
  mapLocations?: Iterable<MapLocation>,
): Map<string, CachedItemProps> => {
  const map = new Map<string, CachedItemProps>()
  const indicatorFunc = makeTagIndicatorFunc(tagIndicators)
  const locMatchFunc = makeMapLocationMatchFunc(mapLocations ?? [])

  for (const item of items) {
    let url
    let onClick
    let mapURL
    let onClickLocation

    const mapLoc = item.location ? locMatchFunc(item.location) : undefined

    if (mapLoc) {
      mapURL =
        window.origin +
        router.history.createHref(
          router.buildLocation({
            to: mapRoute.to,
            hash: `loc=${mapLoc.id}`,
          }).href,
        )

      onClickLocation = (e: MouseEvent) => {
        e.preventDefault()
        router.navigate({
          to: mapRoute.to,
          hash: `loc=${mapLoc.id}`,
        })
      }
    }

    if (item.type == "event") {
      const routeHref = router.buildLocation({
        to: eventDetailsRoute.to,
        params: {
          eventId: item.id,
        },
      }).href

      url = window.origin + router.history.createHref(routeHref)

      onClick = (e: MouseEvent) => {
        e.preventDefault()
        router.navigate({
          to: eventDetailsRoute.to,
          params: {
            eventId: item.id,
          },
          state: {
            backURL: window.location.href,
          },
        })
      }
    }

    const indicator = indicatorFunc(item.tags ?? [])

    map.set(item.id, {
      url,
      onClick,
      ...(indicator && { indicator }),
      ...(mapURL && { mapURL }),
      ...(onClickLocation && { onClickLocation }),
    })
  }

  return map
}

export const CachedItemPropsContext = createContext<
  ReadonlyMap<string, CachedItemProps>
>(new Map())

const WrappedItemDetails = memo((props: ItemDetailsProps) => {
  const {
    item: { id },
  } = props

  const config = useViewerConfig()
  const cachedProps = use(CachedItemPropsContext).get(props.item.id)

  const isBookmarked = useIsSelected("bookmarks", id)
  const setBookmarked = useSetSelected("bookmarks", id)

  return (
    <ItemDetails
      {...props}
      url={cachedProps?.url ?? props.url}
      tags={config.tags}
      bookmarked={isBookmarked ?? props.bookmarkCount}
      setBookmarked={setBookmarked ?? props.setBookmarked}
      locationHref={cachedProps?.mapURL ?? props.locationHref}
      onClickLocation={cachedProps?.onClickLocation ?? props.onClickLocation}
      showShare
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
  const cachedProps = use(CachedItemPropsContext).get(props.item.id)

  return (
    <ItemPill
      {...props}
      href={cachedProps?.url}
      onClick={cachedProps?.onClick}
      indicator={cachedProps?.indicator}
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

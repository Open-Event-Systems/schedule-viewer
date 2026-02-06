import {
  parseMapFlag,
  parseScheduleEvent,
  parseVendor,
  type ScheduleItem,
} from "@open-event-systems/schedule-lib"
import {
  ItemDetails,
  makeTagIndicatorFunc,
  useIsSelected,
  useSetSelected,
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
import { eventDetailsRoute } from "./routes.js"
import { useViewerConfig } from "./config.js"
import type { makeRouter } from "./router.js"

export const parsers = {
  event: parseScheduleEvent,
  vendor: parseVendor,
  "map-flag": parseMapFlag,
} as const

export type CachedItemProps = {
  url?: string
  onClick?: (e: MouseEvent) => void
  indicator?: string
}

export const makeCachedItemPropsMap = (
  router: ReturnType<typeof makeRouter>,
  items: Iterable<ScheduleItem>,
  tagIndicators: Iterable<TagIndicatorEntry>,
): Map<string, CachedItemProps> => {
  const map = new Map<string, CachedItemProps>()
  const indicatorFunc = makeTagIndicatorFunc(tagIndicators)

  for (const item of items) {
    let url
    let onClick

    if (item.type == "event") {
      url = new URL(
        router.buildLocation({
          to: eventDetailsRoute.to,
          params: {
            eventId: item.id,
          },
        }).href,
        window.origin,
      ).href

      onClick = (e: MouseEvent) => {
        e.preventDefault()
        router.navigate({
          to: eventDetailsRoute.to,
          params: {
            eventId: item.id,
          },
        })
      }
    }

    let indicator

    if ("tags" in item) {
      indicator = indicatorFunc(item.tags as ReadonlySet<string>)
    }

    map.set(item.id, {
      url,
      onClick,
      ...(indicator && { indicator }),
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
      url={cachedProps?.url}
      tags={config.tags}
      bookmarked={isBookmarked}
      setBookmarked={setBookmarked}
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

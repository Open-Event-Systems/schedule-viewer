import {
  parseMapFlag,
  parseScheduleEvent,
  parseVendor,
  type ScheduleItem,
} from "@open-event-systems/schedule-lib"
import type { Register } from "@tanstack/react-router"
import { eventDetailsRoute, mapRoute } from "./routes.js"
import type { MapLocationMatchFunc } from "@open-event-systems/schedule-map"
import {
  type ItemDetailsProps,
  type ItemPillProps,
} from "@open-event-systems/schedule-react"
import type { MouseEvent, ReactNode } from "react"
import {
  WrappedItemDetails,
  WrappedItemPill,
} from "./components/pill/wrapped-pills.js"

export const parsers = {
  event: parseScheduleEvent,
  vendor: parseVendor,
  "map-flag": parseMapFlag,
} as const

export type ItemNavProps = Readonly<{
  url?: string
  onClick?: (e: MouseEvent) => void
  locationHref?: string
  onClickLocation?: (e: MouseEvent) => void
}>

export const getItemNavProps = (
  router: Register["router"],
  item: ScheduleItem,
  mapLocationMatchFunc: MapLocationMatchFunc | undefined,
): ItemNavProps => {
  const history = router.history
  let url
  let locationHref
  let onClick
  let onClickLocation

  if (item.type == "event") {
    url =
      window.origin +
      history.createHref(
        router.buildLocation({
          to: eventDetailsRoute.to,
          params: {
            eventId: item.id,
          },
        }).href,
      )
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

  if (
    mapLocationMatchFunc &&
    "location" in item &&
    typeof item.location == "string" &&
    item.location
  ) {
    const loc = mapLocationMatchFunc(item.location)
    if (loc) {
      locationHref =
        window.origin +
        history.createHref(
          router.buildLocation({
            to: mapRoute.to,
            hash: `loc=${loc.id}`,
          }).href,
        )
      onClickLocation = (e: MouseEvent) => {
        e.preventDefault()
        router.navigate({
          to: mapRoute.to,
          hash: `loc=${loc.id}`,
        })
      }
    }
  }

  return {
    url,
    onClick,
    locationHref,
    onClickLocation,
  }
}

export const makeItemNavPropsMap = (
  router: Register["router"],
  mapLocationMatchFunc: MapLocationMatchFunc | undefined,
  items: Iterable<ScheduleItem>,
): ReadonlyMap<string, ItemNavProps> => {
  const map = new Map<string, ItemNavProps>()
  for (const item of items) {
    map.set(item.id, getItemNavProps(router, item, mapLocationMatchFunc))
  }
  return map
}

export const makeRenderItemDetailsFunc = (
  itemNavPropsMap: ReadonlyMap<string, ItemNavProps>,
) => {
  // eslint-disable-next-line react/display-name
  return (props: ItemDetailsProps) => {
    const { item } = props

    const navProps = itemNavPropsMap.get(item.id)

    return (
      <WrappedItemDetails
        key={item.id}
        {...props}
        url={navProps?.url}
        locationHref={navProps?.locationHref}
        onClickLocation={navProps?.onClickLocation}
        showShare
      />
    )
  }
}

export const makeRenderPillFunc = (
  renderItemDetailsFunc: (props: ItemDetailsProps) => ReactNode,
  tagIndicatorFunc: (tags: Iterable<string>) => string | undefined,
  itemNavPropsMap: ReadonlyMap<string, ItemNavProps>,
) => {
  // eslint-disable-next-line react/display-name
  return (props: ItemPillProps) => {
    const { item } = props

    const navProps = itemNavPropsMap.get(item.id)

    return (
      <WrappedItemPill
        key={item.id}
        {...props}
        tagIndicatorFunc={tagIndicatorFunc}
        ItemHoverCardProps={{
          ...props.ItemHoverCardProps,
          renderItemDetails: renderItemDetailsFunc,
        }}
        href={navProps?.url}
        onClickBody={navProps?.onClick}
      />
    )
  }
}

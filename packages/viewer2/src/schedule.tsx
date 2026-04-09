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
  origin: string,
  getCurrentURL: () => string,
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
      origin +
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
          backURL: getCurrentURL(),
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
        origin +
        history.createHref(
          router.buildLocation({
            to: mapRoute.to,
            search: {
              show: loc.id,
            },
          }).href,
        )
      onClickLocation = (e: MouseEvent) => {
        e.preventDefault()
        router.navigate({
          to: mapRoute.to,
          search: {
            show: loc.id,
          },
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
  origin: string,
  getCurrentURL: () => string,
  mapLocationMatchFunc: MapLocationMatchFunc | undefined,
  items?: Iterable<ScheduleItem>,
): ReadonlyMap<string, ItemNavProps> => {
  const map = new Map<string, ItemNavProps>()
  for (const item of items ?? []) {
    map.set(
      item.id,
      getItemNavProps(
        router,
        origin,
        getCurrentURL,
        item,
        mapLocationMatchFunc,
      ),
    )
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

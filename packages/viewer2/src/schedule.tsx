import {
  parseMapFlag,
  parseScheduleEvent,
  parseVendor,
  type DetailedScheduleItem,
  type ScheduleItem,
} from "@open-event-systems/schedule-lib"
import type { Register } from "@tanstack/react-router"
import { eventDetailsRoute, mapRoute, vendorDetailsRoute } from "./routes.js"
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
  getLocationProps?: (
    locName: string,
  ) => { href?: string; onClick: (e: MouseEvent) => void } | undefined
}>

export const getItemNavProps = (
  router: Register["router"],
  getCurrentURL: () => string,
  item: ScheduleItem,
  mapLocationMatchFunc: MapLocationMatchFunc | undefined,
): ItemNavProps => {
  const history = router.history
  let url
  let onClick

  if (item.type == "event") {
    url =
      router.origin +
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
  } else if (item.type == "vendor") {
    url =
      router.origin +
      history.createHref(
        router.buildLocation({
          to: vendorDetailsRoute.to,
          params: {
            vendorId: item.id,
          },
        }).href,
      )
    onClick = (e: MouseEvent) => {
      e.preventDefault()
      router.navigate({
        to: vendorDetailsRoute.to,
        params: {
          vendorId: item.id,
        },
        state: {
          backURL: getCurrentURL(),
        },
      })
    }
  }

  const getLocationProps = (locName: string) => {
    if (mapLocationMatchFunc) {
      const loc = mapLocationMatchFunc(locName)
      if (loc) {
        const locationHref =
          router.origin +
          history.createHref(
            router.buildLocation({
              to: mapRoute.to,
              search: {
                show: loc.id,
              },
            }).href,
          )
        const onClick = (e: MouseEvent) => {
          e.preventDefault()
          router.navigate({
            to: mapRoute.to,
            search: {
              show: loc.id,
            },
          })
        }

        return {
          href: locationHref,
          onClick,
        }
      }
    }
  }

  return {
    url,
    onClick,
    getLocationProps,
  }
}

export const makeItemNavPropsMap = (
  router: Register["router"],
  getCurrentURL: () => string,
  mapLocationMatchFunc: MapLocationMatchFunc | undefined,
  items?: Iterable<ScheduleItem>,
): ReadonlyMap<string, ItemNavProps> => {
  const map = new Map<string, ItemNavProps>()
  for (const item of items ?? []) {
    map.set(
      item.id,
      getItemNavProps(router, getCurrentURL, item, mapLocationMatchFunc),
    )
  }
  return map
}

export const makeItemsByIdMap = (
  items?: Iterable<DetailedScheduleItem>,
): ReadonlyMap<string, readonly DetailedScheduleItem[]> => {
  const map = new Map<string, DetailedScheduleItem[]>()

  for (const item of items ?? []) {
    let arr = map.get(item.id)
    if (!arr) {
      arr = []
      map.set(item.id, arr)
    }
    arr.push(item)
  }

  return map
}

export const makeRenderItemDetailsFunc = (
  itemNavPropsMap: ReadonlyMap<string, ItemNavProps>,
  itemsById: ReadonlyMap<string, readonly DetailedScheduleItem[]>,
) => {
  // eslint-disable-next-line react/display-name
  return (props: ItemDetailsProps) => {
    const { itemId } = props

    const occs = itemsById.get(itemId) ?? []

    const navProps = itemNavPropsMap.get(itemId)

    return (
      <WrappedItemDetails
        key={itemId}
        {...props}
        occurrences={occs}
        getLocationProps={navProps?.getLocationProps}
        shareURL={navProps?.url}
        buttonOptions={[
          "share",
          "bookmark",
          ...(occs[0]?.type == "vendor" ? (["visited"] as const) : []),
        ]}
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

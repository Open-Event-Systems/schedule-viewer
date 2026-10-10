import { ScheduleLoader } from "#src/queries/schedule.js"
import { mainLayoutRoute } from "#src/router/routes/root.js"
import type { ScheduleItemType } from "@open-event-systems/schedule-lib"
import {
  createRoute,
  lazyRouteComponent,
  notFound,
} from "@tanstack/react-router"

const itemDetailsRoutes = createRoute({
  id: "itemDetails",
  getParentRoute: () => mainLayoutRoute,
})

export const itemDetailsRoute = createRoute({
  path: "/$itemType/$itemId",
  getParentRoute: () => itemDetailsRoutes,
  params: {
    parse: ({ itemType, ...other }) => {
      let type: ScheduleItemType
      switch (itemType) {
        case "events":
          type = "event"
          break
        case "vendors":
          type = "vendor"
          break
        case "amenities":
          type = "amenity"
          break
        default:
          return false
      }

      return { ...other, itemType: type }
    },
    stringify: ({ itemType, ...other }) => {
      let typeStr: string
      switch (itemType) {
        case "event":
          typeStr = "events"
          break
        case "vendor":
          typeStr = "vendors"
          break
        case "amenity":
          typeStr = "amenities"
          break
      }
      return { itemType: typeStr, ...other }
    },
  },
  loader: async ({
    context: { appContextPromise },
    params: { itemType, itemId },
  }) => {
    const { config } = await appContextPromise

    const items = await ScheduleLoader.items(appContextPromise)

    const item = items.getType(itemType).getById(itemId)
    if (!item) {
      throw notFound()
    }

    return {
      itemTitle: item.item.name,
      scheduleTitle: config.name,
    }
  },
  head: ({ loaderData }) => {
    if (loaderData && loaderData.itemTitle) {
      return {
        meta: [
          {
            title: `${loaderData.itemTitle} - ${loaderData.scheduleTitle} Schedule`,
          },
        ],
      }
    }
    return {}
  },
  component: lazyRouteComponent(
    () => import("../components/details/details-route.js"),
    "ItemDetailsRoute",
  ),
})

export default itemDetailsRoutes.addChildren([itemDetailsRoute])

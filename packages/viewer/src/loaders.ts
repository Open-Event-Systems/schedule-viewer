import { sessionSelectionsQueryOptions } from "@open-event-systems/schedule-react"

export const getQueryOptions = async () => {
  const [{ itemQueryOptions, selectionsQueryOptions }, parsers] =
    await Promise.all([
      import("@open-event-systems/schedule-react").then(
        ({
          itemQueryOptions,
          selectionsQueryOptions,
          sessionSelectionsQueryOptions,
        }) => ({
          itemQueryOptions,
          selectionsQueryOptions,
          sessionSelectionsQueryOptions,
        }),
      ),
      import("@open-event-systems/schedule-lib").then(
        ({ parseScheduleEvent, parseVendor, parseMapFlag }) =>
          ({
            event: parseScheduleEvent,
            vendor: parseVendor,
            "map-flag": parseMapFlag,
          }) as const,
      ),
    ])

  return {
    itemQueryOptions,
    selectionsQueryOptions,
    sessionSelectionsQueryOptions,
    parsers,
  }
}

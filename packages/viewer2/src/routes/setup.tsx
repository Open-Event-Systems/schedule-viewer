import { Outlet } from "@tanstack/react-router"
import { ViewerConfigContext } from "../config.js"
import { setupRoute } from "../routes.js"
import {
  ScheduleAPIContext,
  ScheduleConfigContext,
  SelectionsAPIContext,
} from "@open-event-systems/schedule-react"

export const SetupRoute = () => {
  const { config, scheduleAPI, selectionsAPI } = setupRoute.useRouteContext()

  return (
    <ScheduleConfigContext value={config}>
      <ViewerConfigContext value={config}>
        <ScheduleAPIContext value={scheduleAPI}>
          <SelectionsAPIContext value={selectionsAPI}>
            <Outlet />
          </SelectionsAPIContext>
        </ScheduleAPIContext>
      </ViewerConfigContext>
    </ScheduleConfigContext>
  )
}

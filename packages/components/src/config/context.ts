import { RequiredScheduleConfig } from "@open-event-systems/schedule-lib"
import { createContext, useContext } from "react"

const getDefaultTZ = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (_e) {
    return "America/New_York"
  }
}

export const ScheduleConfigContext = createContext<RequiredScheduleConfig>({
  url: "events.json",
  title: "Event",
  dayChangeHour: 6,
  timeZone: getDefaultTZ(),
  tagIndicators: [],
})

export const ScheduleConfigProvider = ScheduleConfigContext.Provider

export const useScheduleConfig = (): RequiredScheduleConfig =>
  useContext(ScheduleConfigContext)

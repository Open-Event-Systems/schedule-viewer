import { createContext, useContext } from "react"

export type ScheduleConfigContextData = {
  dayChangeHour: number
  timeZone: string
}

const getDefaultTZ = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (_e) {
    return "America/New_York"
  }
}

export const ScheduleConfigContext = createContext<ScheduleConfigContextData>({
  dayChangeHour: 6,
  timeZone: getDefaultTZ(),
})

export const ScheduleConfigProvider = ScheduleConfigContext.Provider

export const useScheduleConfig = (): ScheduleConfigContextData =>
  useContext(ScheduleConfigContext)

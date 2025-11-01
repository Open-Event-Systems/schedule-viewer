import { createContext, useContext } from "react"
import { DEFAULT_SCHEDULE_CONFIG } from "../config.js"
import type { ScheduleConfig } from "../types.js"

export const ScheduleConfigContext = createContext<ScheduleConfig>(
  DEFAULT_SCHEDULE_CONFIG,
)
export const useScheduleConfig = (): ScheduleConfig =>
  useContext(ScheduleConfigContext)

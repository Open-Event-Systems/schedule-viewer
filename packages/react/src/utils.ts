import { scheduleViewTypes, type ScheduleViewType } from "./types.js"

export const isScheduleViewType = (t: unknown): t is ScheduleViewType =>
  typeof t == "string" && t in scheduleViewTypes

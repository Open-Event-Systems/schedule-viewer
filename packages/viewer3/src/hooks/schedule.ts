import type { ScheduleAPI, ScheduleItem } from "@open-event-systems/schedule-lib"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ScheduleQueryOptions } from "../queries/schedule.js"
import { useAppContext } from "./app.js"

export const useScheduleAPI = (): ScheduleAPI => {
  const { scheduleAPI } = useAppContext()
  return scheduleAPI
}

export const useScheduleItems = (): readonly ScheduleItem[] => {
  const api = useScheduleAPI()
  const query = useSuspenseQuery(ScheduleQueryOptions.items(api))
  return query.data
}
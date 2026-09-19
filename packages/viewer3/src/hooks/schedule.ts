import type {
  ScheduleAPI,
  ScheduleData,
} from "@open-event-systems/schedule-lib"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useAppContext } from "../app.js"
import { ScheduleQueryOptions } from "../queries/schedule.js"

export const useScheduleAPI = (): ScheduleAPI => {
  const { scheduleAPI } = useAppContext()
  return scheduleAPI
}

export const useScheduleData = (): ScheduleData => {
  const api = useScheduleAPI()
  const query = useSuspenseQuery(ScheduleQueryOptions.items(api))
  return query.data
}

import {
  makeScheduleItemCollection,
  type ScheduleItem,
  type ScheduleItemCollection,
} from "@open-event-systems/schedule-lib"
import { useLocation, type ParsedLocation } from "@tanstack/react-router"
import { parseISO } from "date-fns"
import { use, useMemo, type Context } from "react"
let overrideDate: Date | undefined

export const getNow = (loc: ParsedLocation): Date => {
  const hashParams = new URLSearchParams(loc.hash)
  const dateParam = hashParams.get("date")

  if (dateParam) {
    const parsed = parseISO(dateParam)
    if (!isNaN(parsed.getTime())) {
      overrideDate = parsed
    }
  }

  if (overrideDate) {
    return overrideDate
  }

  return new Date()
}

export const useNow = (): Date => {
  const loc = useLocation()
  return useMemo(() => getNow(loc), [loc.hash])
}

export const useRequiredContext = <T>(ctx: Context<T | undefined>): T => {
  const val = use(ctx)
  if (val === undefined) {
    throw new Error("Required context not provided")
  }

  return val
}

export const combineScheduleItems = <Ts extends readonly ScheduleItem[]>(
  ...collections: { [K in keyof Ts]: Iterable<Ts[K]> }
): ScheduleItemCollection<Ts[number]> => {
  function* combine() {
    for (const coll of collections) {
      for (const item of coll) {
        yield item
      }
    }
  }

  return makeScheduleItemCollection(combine())
}

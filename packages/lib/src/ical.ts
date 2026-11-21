import type { ScheduleData } from "#src/data.js"
import { iterToArr } from "#src/utils.js"
import type { Dayjs } from "dayjs"
import dayjs from "dayjs"
import durationPlugin from "dayjs/plugin/duration.js"
import tzPlugin from "dayjs/plugin/timezone.js"
import utcPlugin from "dayjs/plugin/utc.js"
import ical, { ICalEventStatus, type ICalEventData } from "ical-generator"
import {
  ScheduleEventStatus,
  type Occurrence,
  type OccurrenceLocation,
  type ScheduleItemSeries,
} from "./types.js"

dayjs.extend(durationPlugin)
dayjs.extend(utcPlugin)
dayjs.extend(tzPlugin)

export type CreateICSOptions = Readonly<{
  /**
   * A schedule id.
   */
  scheduleId: string

  /**
   * The base URL.
   */
  baseURL: string

  /**
   * The current time.
   */
  now: Dayjs

  /**
   * Calendar name.
   */
  name: string

  /**
   * Timezone.
   */
  timeZone: string

  /**
   * The start date used for events with no explicit start date.
   */
  defaultStartDate?: Dayjs

  /**
   * The end time used for events with no explicit end date.
   */
  defaultEndDate?: Dayjs
}>

/**
 * Create an iCalendar file containing the provided events.
 *
 * @param data - An iterable of series.
 * @param options - Options.
 */
export const createICS = (
  entries: Iterable<ScheduleItemSeries> | null | undefined,
  data: ScheduleData,
  options: CreateICSOptions,
): string => {
  const entriesArr = iterToArr(entries)
  let defaultStartDate = options.defaultStartDate?.tz(options.timeZone)
  let defaultEndDate = options.defaultEndDate?.tz(options.timeZone)

  if (!defaultStartDate || !defaultEndDate) {
    const { minStartDate, maxEndDate } = getDefaultDates(entriesArr, { timeZone: options.timeZone })
    if (!defaultStartDate) {
      defaultStartDate = minStartDate
    }

    if (!defaultEndDate) {
      defaultEndDate = maxEndDate
    }
  }

  const calendar = ical({
    name: options.name,
    timezone: options.timeZone,
  })

  const finalOptions = {
    ...options,
    defaultStartDate,
    defaultEndDate,
  }

  for (const series of entriesArr) {
    for (const occData of handleSeries(series, data, finalOptions)) {
      calendar.createEvent(occData)
    }
  }

  return calendar.toString()
}

const handleSeries = (
  series: ScheduleItemSeries,
  data: ScheduleData,
  options: CreateICSOptions & { defaultStartDate: Dayjs; defaultEndDate: Dayjs },
): ICalEventData[] => {
  const occDatas = []

  for (const occ of series.occurrences) {
    const occData: ICalEventData = {
      ...getBaseAttrs(series, occ.id, options),
      ...getOccurrenceAttrs(occ, data, options),
    }

    occDatas.push(occData)
  }

  return occDatas
}

const getBaseAttrs = (
  series: ScheduleItemSeries,
  occurrenceId: string,
  options: CreateICSOptions,
): Omit<ICalEventData, "start" | "end"> => {
  const attrs: Omit<ICalEventData, "start" | "end"> = {
    id: getUID(options.scheduleId, occurrenceId, options.baseURL),
    stamp: options.now.utc(),
    lastModified: options.now.utc(),
    timezone: options.timeZone,
  }

  if (series.item.name) {
    attrs.summary = series.item.name
  }

  if (series.item.description) {
    attrs.description = series.item.description
  }

  if ("eventStatus" in series.item) {
    if (series.item.eventStatus == ScheduleEventStatus.canceled) {
      attrs.status = ICalEventStatus.CANCELLED
    } else {
      attrs.status = ICalEventStatus.CONFIRMED
    }
  }

  return attrs
}

const getOccurrenceAttrs = (
  occ: Occurrence,
  data: ScheduleData,
  options: CreateICSOptions & { defaultStartDate: Dayjs; defaultEndDate: Dayjs },
): ICalEventData => {
  const startDate = occ.startDate ?? options.defaultStartDate
  const endDate = occ.endDate ?? options.defaultEndDate

  const attrs: Omit<ICalEventData, "start" | "end"> = {}

  const locs = getLocations(data, occ.locations)
  if (locs) {
    attrs.location = { title: locs }
  }

  return {
    start: startDate.tz(options.timeZone),
    end: endDate.tz(options.timeZone),
    ...attrs,
  }
}

const getUID = (scheduleId: string, occurrenceId: string, baseURL: string) => {
  const urlObj = new URL(scheduleId, baseURL)
  urlObj.hash = "#" + occurrenceId
  return urlObj.toString()
}

const getLocations = (
  data: ScheduleData,
  locs: Iterable<OccurrenceLocation>,
): string | undefined => {
  const resolved = iterToArr(locs)
    .map((loc) => getLocation(data, loc))
    .filter((loc) => loc != null)
  if (resolved.length > 0) {
    return resolved.join(", ")
  }
}

const getLocation = (data: ScheduleData, loc: OccurrenceLocation): string | undefined => {
  const res = data.getType("location").get(loc)
  if (res && res.item.name) {
    return res.item.name
  } else if (loc.name) {
    return loc.name
  } else {
    return loc.id
  }
}

const getDefaultDates = (
  data: Iterable<ScheduleItemSeries>,
  opts: { timeZone: string },
): { minStartDate: Dayjs; maxEndDate: Dayjs } => {
  const { timeZone } = opts

  let minStartDate = dayjs()
    .set("hour", 0)
    .set("minute", 0)
    .set("second", 0)
    .set("millisecond", 0)
    .tz(timeZone)
  let maxEndDate = minStartDate.add(1, "day")

  for (const series of data) {
    for (const occ of series.occurrences) {
      if (occ.startDate && occ.startDate.isBefore(minStartDate)) {
        minStartDate = occ.startDate
      }
      if (occ.endDate && occ.endDate.isAfter(maxEndDate)) {
        maxEndDate = occ.endDate
      }
    }
  }

  return { minStartDate: minStartDate.tz(timeZone), maxEndDate: maxEndDate.tz(timeZone) }
}

import { Gantt, type GanttTrack } from "#src/components/gantt/gantt.js"
import type { ScheduleViewProps } from "#src/components/schedule-view/schedule-view.js"
import { useProps } from "@mantine/core"
import {
  isBounded,
  toOccurrenceArray,
  type ScheduleItem,
  type ScheduleItemOccurrence,
  type SeriesOrOccurrence,
} from "@open-event-systems/schedule-lib"
import clsx from "clsx"
import { useMemo } from "react"

export type GanttViewProps = ScheduleViewProps & { type: "gantt" }

export const GanttView = (props: GanttViewProps) => {
  const { items, rootProps } = useProps("GanttView", null, props)

  const { className, ...other } = rootProps ?? {}

  const trackData = useTrackData(items)

  let minDt
  let maxDt

  for (const { occurrences } of trackData) {
    for (const occ of occurrences) {
      if (occ.startDate && (!minDt || occ.startDate.isBefore(minDt))) {
        minDt = occ.startDate
      }

      if (occ.endDate && (!maxDt || occ.endDate.isAfter(maxDt))) {
        maxDt = occ.endDate
      }
    }
  }

  const tracks = trackData.map(
    ({ item, occurrences }) =>
      ({
        id: item.id,
        name: item.name || item.id,
        items: occurrences.map((occ) => ({
          startDate: occ.startDate,
          endDate: occ.endDate,
        })),
      }) satisfies GanttTrack,
  )

  return (
    <Gantt
      className={clsx("GanttView-root", className)}
      tracks={tracks}
      startDate={minDt}
      endDate={maxDt}
      {...other}
    />
  )
}

const useTrackData = (
  data?: Iterable<SeriesOrOccurrence> | null,
): readonly Readonly<{
  item: ScheduleItem
  occurrences: readonly ScheduleItemOccurrence[]
}>[] => {
  return useMemo(() => {
    const byItem = new Map<
      string,
      { item: ScheduleItem; occurrences: ScheduleItemOccurrence[] }
    >()

    for (const obj of data ?? []) {
      let entry = byItem.get(obj.item.id)

      if (!entry) {
        entry = { item: obj.item, occurrences: [] }
        byItem.set(obj.item.id, entry)
      }

      entry.occurrences.push(...toOccurrenceArray(obj).filter(isBounded))
    }

    return [...byItem.values()]
  }, [data])
}

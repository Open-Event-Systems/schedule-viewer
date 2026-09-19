import type { Dayjs } from "dayjs"
import type { MouseEvent } from "react"

export type LocationViewProps = Readonly<{
  name?: string
  href?: string
  onClick?: (e: MouseEvent) => void
}>

export type OccurrenceViewProps = Readonly<{
  startDate?: Dayjs
  endDate?: Dayjs
  locations?: Iterable<string | LocationViewProps>
}>

export type ContactViewProps = Readonly<{
  name?: string
  iconURL?: string
  href?: string
  onClick?: (e: MouseEvent) => void
}>

import type {
  Day,
  DetailedScheduleItem,
} from "@open-event-systems/schedule-lib"
import type { ComponentType, ReactNode } from "react"
import type { ItemPillsProps } from "../pill/item-pills.js"
import { Text, type TextProps } from "@mantine/core"
import type { TagEntry } from "../../types.js"

export type BaseScheduleComponentProps = {
  className?: string
  items?: Iterable<DetailedScheduleItem>
  now?: Date
  tags?: Iterable<TagEntry>
  days?: Iterable<Day>
  selectedDay?: Day
  dayChangeHour?: number
  getDayHref?: (day: Day) => string | undefined
  onSelectDay?: (day: Day) => void
  dayFormat?: string
  renderItemPills?: (props: ItemPillsProps) => ReactNode
}

type ScheduleComponentMap<M> = {
  readonly [K in keyof M]: ComponentType<M[K]>
}

type ScheduleComponentProps<M> = { [K in keyof M]: M[K] & { type: K } }[keyof M]

type ScheduleComponent<M> = ComponentType<ScheduleComponentProps<M>>

/**
 * Renders a schedule component.
 */
export const makeScheduleComponent = <
  M extends { readonly [key: string]: BaseScheduleComponentProps },
>(
  components: ScheduleComponentMap<M>,
): ScheduleComponent<M> => {
  const component = (props: ScheduleComponentProps<M>) => {
    const { type, ...other } = props

    const Component = components[type] as ComponentType<
      Omit<M[keyof M], "type">
    >

    return <Component {...other} />
  }

  return component
}

export const NoItemsMessage = (props: TextProps) => (
  <Text c="dimmed" ta="center" {...props}>
    No items
  </Text>
)

import type { ComponentType } from "react"
import { Text, type TextProps } from "@mantine/core"
import {
  CatalogView,
  DailyAgendaView,
  DailyCatalogView,
  FullAgendaView,
  TagsView,
} from "./binned-views.js"
import { GanttView } from "./gantt.js"

type ComponentMap<PM> = {
  readonly [T in keyof PM]: PM[T] extends { type: unknown }
    ? never
    : ComponentType<PM[T]>
}

type ScheduleComponentProps<PM> = {
  [T in keyof PM]: PM[T] & { type: T }
}[keyof PM]

type ScheduleComponentType<PM> = ComponentType<ScheduleComponentProps<PM>>

/**
 * Renders a schedule component.
 */
export const makeScheduleComponent = <PM,>(
  components: ComponentMap<PM>,
): ScheduleComponentType<PM> => {
  const component = (props: ScheduleComponentProps<PM>) => {
    const { type, ...other } = props

    const Component = components[type] as ComponentType<
      Omit<ScheduleComponentProps<PM>, "type">
    >

    if (Component) {
      return <Component {...other} />
    } else {
      console.error(`Unsupported component type: ${String(type)}`)
      return undefined
    }
  }

  return component
}

export const NoItemsMessage = (props: TextProps) => (
  <Text c="dimmed" ta="center" {...props}>
    No items
  </Text>
)

/**
 * Default schedule component implementation.
 */
export const Schedule = makeScheduleComponent({
  "daily-agenda": DailyAgendaView,
  "full-agenda": FullAgendaView,
  "daily-catalog": DailyCatalogView,
  catalog: CatalogView,
  tags: TagsView,
  gantt: GanttView,
})

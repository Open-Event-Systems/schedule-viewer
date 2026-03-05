import {
  Grid,
  type GridProps,
  Switch,
  type SwitchProps,
  Text,
  TextInput,
  type TextInputProps,
  useProps,
} from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import clsx from "clsx"
import { memo, type NamedExoticComponent, type ReactNode } from "react"

export type FilterProps = {
  /**
   * The text filter node.
   */
  text?: ReactNode

  /**
   * The "show past events" switch node.
   */
  pastEvents?: ReactNode

  /**
   * The tag filter node.
   */
  tagFilter?: ReactNode

  /**
   * Whether to hide the "show past events" section.
   */
  noPastEventsOption?: boolean
} & GridProps

type FilterComponent = NamedExoticComponent<FilterProps> & {
  Text: typeof FilterText
  PastEvents: typeof FilterPastEvents
}

/**
 * Combined schedule filter component.
 */
const _Filter = memo((props: FilterProps) => {
  const {
    className,
    text,
    pastEvents,
    tagFilter,
    noPastEventsOption,
    ...other
  } = useProps("Filter", {}, props)

  return (
    <Grid className={clsx("Filter-root", className)} {...other}>
      <Grid.Col span={{ xs: 12 }}>{text}</Grid.Col>
      {!noPastEventsOption && (
        <Grid.Col span={{ xs: 12 }}>{pastEvents}</Grid.Col>
      )}
      <Grid.Col span={{ xs: 12 }}>
        <Text size="xs" c="dimmed">
          Filter Tags
        </Text>
        {tagFilter}
      </Grid.Col>
    </Grid>
  )
}) as Partial<FilterComponent>

_Filter.displayName = "Filter"

export type FilterTextProps = TextInputProps

export const FilterText = memo((props: FilterTextProps) => (
  <TextInput
    title="Search"
    leftSection={<IconSearch />}
    {...props}
    className={clsx("Filter-text", props.className)}
  />
))

FilterText.displayName = "Filter.Text"

export type FilterPastEventsProps = SwitchProps

export const FilterPastEvents = memo((props: FilterPastEventsProps) => (
  <Switch
    label="Show past events"
    {...props}
    className={clsx("Filter-pastEvents", props.className)}
  />
))

FilterPastEvents.displayName = "Filter.PastEvents"

_Filter.Text = FilterText
_Filter.PastEvents = FilterPastEvents

export const Filter = _Filter as FilterComponent

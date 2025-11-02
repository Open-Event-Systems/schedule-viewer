import {
  Grid,
  type GridProps,
  Switch,
  Text,
  TextInput,
  useProps,
} from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import clsx from "clsx"
import { TagFilter } from "../tag-filter/tag-filter.js"
import { useContext } from "react"
import type { TagEntry, TagIndicatorEntry } from "../../types.js"
import { useScheduleConfig } from "../../hooks/config.js"
import { FilterContext } from "../../hooks/filter.js"

export type FilterProps = {
  tags?: Iterable<TagEntry>
  tagIndicators?: readonly TagIndicatorEntry[]
  noPastEventsOption?: boolean

  disabledTags?: Iterable<string>
  text?: string
  showPastEvents?: boolean
  onChangeTags?: (tags: Set<string>) => void
  onChangeText?: (text: string) => void
  onChangeShowPastEvents?: (show: boolean) => void
} & GridProps

export const Filter = (props: FilterProps) => {
  const config = useScheduleConfig()
  const ctx = useContext(FilterContext)
  const {
    className,
    disabledTags = ctx.disabledTags,
    tags = config.tags,
    tagIndicators = config.tagIndicators,
    noPastEventsOption,
    text = ctx.text,
    showPastEvents = ctx.showPastEvents,
    onChangeTags = ctx.onChangeTags,
    onChangeText = ctx.onChangeText,
    onChangeShowPastEvents = ctx.onChangeShowPastEvents,
    ...other
  } = useProps("Filter", {}, props)

  return (
    <Grid className={clsx("Filter-root", className)} {...other}>
      <Grid.Col span={{ xs: 12 }}>
        <TextInput
          title="Search"
          leftSection={<IconSearch />}
          value={text || ""}
          onChange={(e) => {
            onChangeText && onChangeText(e.target.value)
          }}
        />
      </Grid.Col>
      {!noPastEventsOption && (
        <Grid.Col span={{ xs: 12 }}>
          <Switch
            label="Show past events"
            checked={!!showPastEvents}
            onChange={(e) => {
              onChangeShowPastEvents && onChangeShowPastEvents(e.target.checked)
            }}
          />
        </Grid.Col>
      )}
      <Grid.Col span={{ xs: 12 }}>
        <Text size="xs" c="dimmed">
          Filter Tags
        </Text>
        <TagFilter
          disabledTags={disabledTags ?? []}
          tags={tags}
          tagIndicators={tagIndicators}
          onChangeTags={onChangeTags}
        />
      </Grid.Col>
    </Grid>
  )
}

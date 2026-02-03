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

  disabledTags?: ReadonlySet<string>
  text?: string
  showPastEvents?: boolean
  onChangeFilter?: (update: {
    disabledTags?: ReadonlySet<string>
    text?: string
    showPastEvents?: boolean
  }) => void
} & GridProps

export const Filter = (props: FilterProps) => {
  const config = useScheduleConfig()
  const [ctx, updateFilter] = useContext(FilterContext)
  const {
    className,
    disabledTags = ctx.disabledTags,
    tags = config.tags,
    tagIndicators = config.tagIndicators,
    noPastEventsOption,
    text = ctx.text,
    showPastEvents = ctx.showPastEvents,
    onChangeFilter = updateFilter,
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
            onChangeFilter && onChangeFilter({ text: e.target.value })
          }}
        />
      </Grid.Col>
      {!noPastEventsOption && (
        <Grid.Col span={{ xs: 12 }}>
          <Switch
            label="Show past events"
            checked={!!showPastEvents}
            onChange={(e) => {
              onChangeFilter &&
                onChangeFilter({ showPastEvents: e.target.checked })
            }}
          />
        </Grid.Col>
      )}
      <Grid.Col span={{ xs: 12 }}>
        <Text size="xs" c="dimmed">
          Filter Tags
        </Text>
        <TagFilter
          disabledTags={disabledTags}
          tags={tags}
          tagIndicators={tagIndicators}
          onChangeTags={(tags) => {
            onChangeFilter && onChangeFilter({ disabledTags: tags })
          }}
        />
      </Grid.Col>
    </Grid>
  )
}

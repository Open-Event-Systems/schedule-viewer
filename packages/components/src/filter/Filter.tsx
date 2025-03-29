import {
  Grid,
  GridProps,
  Switch,
  Text,
  TextInput,
  useProps,
} from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import clsx from "clsx"
import { TagFilter } from "../tag-filter/TagFilter.js"
export type FilterProps = {
  disabledTags?: Iterable<string>
  text?: string
  showPastEvents?: boolean
  onChangeTags?: (tags: Set<string>) => void
  onChangeText?: (text: string) => void
  onChangeShowPastEvents?: (show: boolean) => void
} & GridProps

export const Filter = (props: FilterProps) => {
  const {
    className,
    disabledTags,
    text,
    showPastEvents,
    onChangeTags,
    onChangeText,
    onChangeShowPastEvents,
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
      <Grid.Col span={{ xs: 12 }}>
        <Switch
          label="Show past events"
          checked={!!showPastEvents}
          onChange={(e) => {
            onChangeShowPastEvents && onChangeShowPastEvents(e.target.checked)
          }}
        />
      </Grid.Col>
      <Grid.Col span={{ xs: 12 }}>
        <Text size="xs" c="dimmed">
          Filter Tags
        </Text>
        <TagFilter
          disabledTags={disabledTags ?? []}
          onChangeTags={onChangeTags}
        />
      </Grid.Col>
    </Grid>
  )
}

import {
  Grid,
  GridProps,
  Switch,
  TextInput,
  useProps,
} from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import clsx from "clsx"
import { TagFilter } from "../tag-filter/TagFilter.js"

export type FilterOptions = {
  text?: string
  disabledTags?: Iterable<string>
  showPastEvents?: boolean
}

export type FilterProps = {
  tags?: Iterable<string>
  options?: FilterOptions
  onChangeOptions?: (newOptions: FilterOptions) => void
} & GridProps

export const Filter = (props: FilterProps) => {
  const { className, tags, options, onChangeOptions, ...other } = useProps(
    "Filter",
    {},
    props
  )

  return (
    <Grid className={clsx("Filter-root", className)} {...other}>
      <Grid.Col span={{ xs: 12 }}>
        <TextInput
          leftSection={<IconSearch />}
          value={options?.text || ""}
          onChange={(e) => {
            onChangeOptions &&
              onChangeOptions({
                ...options,
                text: e.target.value,
              })
          }}
        />
      </Grid.Col>
      <Grid.Col span={{ xs: 12 }}>
        <Switch
          label="Show past events"
          checked={!!options?.showPastEvents}
          onChange={(e) => {
            onChangeOptions &&
              onChangeOptions({
                ...options,
                showPastEvents: e.target.checked,
              })
          }}
        />
      </Grid.Col>
      <Grid.Col span={{ xs: 12 }}>
        <TagFilter
          tags={tags}
          disabledTags={options?.disabledTags ?? []}
          onChangeTags={(tags) => {
            onChangeOptions &&
              onChangeOptions({
                ...options,
                disabledTags: tags,
              })
          }}
        />
      </Grid.Col>
    </Grid>
  )
}

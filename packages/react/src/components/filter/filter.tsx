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
import { createContext, useContext, useMemo, useReducer } from "react"
import type { TagEntry, TagIndicatorEntry } from "../../types.js"
import { useScheduleConfig } from "../../hooks/config.js"

export type FilterSettings = Readonly<{
  disabledTags?: Iterable<string>
  text?: string
  showPastEvents?: boolean
}>

export type FilterCallbacks = Readonly<{
  onChangeTags?: (tags: Set<string>) => void
  onChangeText?: (text: string) => void
  onChangeShowPastEvents?: (show: boolean) => void
}>

export type FilterProps = FilterSettings &
  FilterCallbacks & {
    tags?: Iterable<TagEntry>
    tagIndicators?: readonly TagIndicatorEntry[]
  } & GridProps

export const FilterContext = createContext<FilterSettings & FilterCallbacks>({})

export const useNewFilterContext = (): FilterSettings & FilterCallbacks => {
  const reducer = (
    cur: FilterSettings,
    action: FilterSettings,
  ): FilterSettings => ({ ...cur, ...action })

  const [state, dispatch] = useReducer(reducer, {})

  const callbacks = useMemo<FilterCallbacks>(() => {
    return {
      onChangeShowPastEvents(show) {
        dispatch({ showPastEvents: show })
      },
      onChangeTags(tags) {
        dispatch({ disabledTags: tags })
      },
      onChangeText(text) {
        dispatch({ text })
      },
    }
  }, [dispatch])

  return { ...state, ...callbacks }
}

export const Filter = (props: FilterProps) => {
  const config = useScheduleConfig()
  const ctx = useContext(FilterContext)
  const {
    className,
    disabledTags,
    tags = config.tags,
    tagIndicators,
    text,
    showPastEvents,
    onChangeTags,
    onChangeText,
    onChangeShowPastEvents,
    ...other
  } = useProps("Filter", { ...ctx }, props)

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
          tags={tags}
          tagIndicators={tagIndicators}
          onChangeTags={onChangeTags}
        />
      </Grid.Col>
    </Grid>
  )
}

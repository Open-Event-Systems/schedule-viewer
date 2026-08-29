import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  SchedulePage,
  SchedulePageFeature,
  SchedulePageFeatureNames,
} from "./schedule-page.js"
import { useCallback, useState } from "react"
import { ViewSelect, type ViewSelectProps } from "../view-select/view-select.js"
import {
  SelectionsFilter,
  type SelectionsFilterOption,
  type SelectionsFilterProps,
} from "../filters/selections-filter.js"
import { TextFilter } from "../filters/text-filter.js"
import {
  TagFilter,
  type TagFilterMode,
  type TagFilterProps,
} from "../filters/tag-filter.js"
import { PastEventsFilter } from "../filters/past-events-filter.js"
import { ShareMenu, type ShareMenuProps } from "../share-menu/share-menu.js"
import { tagData, viewSelectOptions } from "../../test-data-new.js"
import { Box } from "@mantine/core"
import { ByDayView } from "../by-day/by-day.js"
import dayjs from "dayjs"

const meta: Meta<typeof SchedulePage> = {
  component: SchedulePage,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    enabledFeatures: Object.values(SchedulePageFeature),
  },
  argTypes: {
    enabledFeatures: {
      options: Object.values(SchedulePageFeature),
      control: {
        type: "check",
        labels: SchedulePageFeatureNames,
      },
    },
  },
  decorators: [
    (Story) => (
      <Box p="xs">
        <Story />
      </Box>
    ),
  ],
}

export default meta

type State = Readonly<{
  view: string
  selections: ReadonlySet<SelectionsFilterOption>
  tagsMode: TagFilterMode
  text: string
  hidePastEvents: boolean
  disabledTags: ReadonlySet<string>
  filterDialogOpen: boolean
  selectedDayKey: string
}>

export const Default: StoryObj<typeof SchedulePage> = {
  render(args) {
    const [state, setState] = useState<State>({
      view: "daily-agenda",
      selections: new Set(),
      tagsMode: "exclude",
      text: "",
      hidePastEvents: true,
      disabledTags: new Set<string>(),
      filterDialogOpen: false,
      selectedDayKey: "2025-01-01",
    })

    const renderViewSelect = useCallback(
      (props: ViewSelectProps) => (
        <ViewSelect
          value={state.view}
          onChange={(view) =>
            setState((prev) => ({ ...prev, view: view || prev.view }))
          }
          {...props}
        />
      ),
      [state.view, setState],
    )

    const renderSelectionsFilter = useCallback(
      (props: SelectionsFilterProps) => (
        <SelectionsFilter
          value={state.selections}
          onChange={(selections) =>
            setState((prev) => ({ ...prev, selections }))
          }
          {...props}
        />
      ),
      [state.selections, setState],
    )

    const renderTagFilter = useCallback(
      (props: TagFilterProps) => (
        <TagFilter
          label="Filter Tags"
          mode={state.tagsMode}
          disabledTags={state.disabledTags}
          onSetDisabled={(tag, disabled) => {
            setState((prev) => {
              const newSet = new Set(prev.disabledTags)
              if (disabled) {
                newSet.add(tag)
              } else {
                newSet.delete(tag)
              }

              return { ...prev, disabledTags: newSet }
            })
          }}
          onSetMode={(mode) =>
            setState((prev) => ({ ...prev, tagsMode: mode }))
          }
          {...props}
        />
      ),
      [state.tagsMode, state.disabledTags, setState],
    )

    const renderShareMenu = useCallback(
      (props: ShareMenuProps) => <ShareMenu {...props} />,
      [],
    )

    let filterCount = 0

    if (state.text) {
      filterCount++
    }

    if (state.disabledTags.size > 0) {
      filterCount++
    }

    if (state.hidePastEvents) {
      filterCount++
    }

    return (
      <SchedulePage
        {...args}
        tags={tagData}
        filterDialogOpen={state.filterDialogOpen}
        onOpenFilterDialog={() =>
          setState((prev) => ({ ...prev, filterDialogOpen: true }))
        }
        onCloseFilterDialog={() =>
          setState((prev) => ({ ...prev, filterDialogOpen: false }))
        }
        viewSelectOptions={viewSelectOptions}
        renderViewSelect={renderViewSelect}
        renderSelectionsFilter={renderSelectionsFilter}
        textFilter={
          <TextFilter
            value={state.text}
            onChange={(e) =>
              setState((prev) => ({ ...prev, text: e.target.value }))
            }
          />
        }
        renderShareMenu={renderShareMenu}
        pastEventsFilter={
          <PastEventsFilter
            checked={state.hidePastEvents}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                hidePastEvents: e.target.checked,
              }))
            }
          />
        }
        renderTagFilter={renderTagFilter}
        filterCount={filterCount}
      >
        <ByDayView
          days={[
            {
              key: "2025-01-01",
              startDate: dayjs(new Date(2025, 0, 1, 6)),
              endDate: dayjs(new Date(2025, 0, 2, 6)),
            },
            {
              key: "2025-01-02",
              startDate: dayjs(new Date(2025, 0, 2, 6)),
              endDate: dayjs(new Date(2025, 0, 3, 6)),
            },
            {
              key: "2025-01-03",
              startDate: dayjs(new Date(2025, 0, 3, 6)),
              endDate: dayjs(new Date(2025, 0, 4, 6)),
            },
          ]}
          selectedDay={state.selectedDayKey}
          onSelectDay={(d) =>
            setState((prev) => ({ ...prev, selectedDayKey: d.key }))
          }
        >
          Content
        </ByDayView>
      </SchedulePage>
    )
  },
}

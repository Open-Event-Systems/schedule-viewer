import { ScheduleView } from "#src/components/newschedule/schedule-view.js"
import { ScheduleDataContext } from "#src/hooks/items.js"
import { TagsConfigContext } from "#src/tags.js"
import { testTagsConfig } from "#src/test-data-new.js"
import {
  getDays,
  sortIntervalsByStartDate,
  toOccurrenceArray,
} from "@open-event-systems/schedule-lib"
import { testData } from "@open-event-systems/schedule-lib/test-data"
import type { Meta, StoryObj } from "@storybook/react-vite"
import dayjs from "dayjs"
import { useState } from "react"

const meta: Meta<typeof ScheduleView> = {
  component: ScheduleView,
  args: {
    items: [...testData.getType("event")],
    now: dayjs("2027-01-16T12:00:00-05:00"),
    renderFirstLevelBinTitle: (props) => <h2 {...props} />,
    renderSecondLevelBinTitle: (props) => <h3 {...props} />,
  },
  decorators: [
    (Story, { args }) => {
      const [selectedDay, setSelectedDay] = useState<string | undefined>()

      return (
        <Story
          args={{
            ...args,
            selectedDay,
            onSelectDay: (d) => setSelectedDay(d.key),
          }}
        />
      )
    },
    (Story, { args }) => {
      const { config, items, byDay, ...other } = args
      let finalItems = items
      let days

      if (byDay) {
        const occs = []

        for (const series of args.items ?? []) {
          if (series.occurrences) {
            occs.push(...toOccurrenceArray(series))
          } else {
            occs.push(series)
          }
        }

        finalItems = sortIntervalsByStartDate(occs)

        days = getDays(finalItems)
      }

      return (
        <Story args={{ config, items: finalItems, ...other, days, byDay }} />
      )
    },
    (Story) => {
      return (
        <ScheduleDataContext.Provider value={testData}>
          <TagsConfigContext.Provider value={testTagsConfig}>
            <Story />
          </TagsConfigContext.Provider>
        </ScheduleDataContext.Provider>
      )
    },
  ],
}

export default meta

export const FullAgenda: StoryObj<typeof ScheduleView> = {
  args: {
    type: "agenda",
    byDay: true,
  },
}

export const DailyAgenda: StoryObj<typeof ScheduleView> = {
  args: {
    type: "agenda",
    byDay: "filter",
  },
}

export const Catalog: StoryObj<typeof ScheduleView> = {
  args: {
    type: "catalog",
  },
}

export const Tags: StoryObj<typeof ScheduleView> = {
  args: {
    type: "tags",
  },
}

export const CatalogByDay: StoryObj<typeof ScheduleView> = {
  args: {
    type: "catalog",
    byDay: "filter",
  },
}

export const CatalogByFullDays: StoryObj<typeof ScheduleView> = {
  args: {
    type: "catalog",
    byDay: true,
  },
}

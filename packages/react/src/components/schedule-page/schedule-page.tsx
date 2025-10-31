import {
  Box,
  Grid,
  Select,
  Stack,
  useProps,
  type StackProps,
} from "@mantine/core"
import {
  createICS,
  isBounded,
  type Day,
  type ScheduleItemStore,
} from "@open-event-systems/schedule-lib"
import clsx from "clsx"
import { Schedule, type ScheduleProps } from "../schedule/schedule.js"
import { Filter } from "../filter/filter.js"
import type { TagEntry } from "../../config/config.js"
import { IconEye } from "@tabler/icons-react"
import { ShareMenu } from "../share-menu/share-menu.js"
import { BookmarkFilter } from "../bookmark-filter/bookmark-filter.js"

export type SchedulePageProps = {
  items: ScheduleItemStore
  tags?: Iterable<TagEntry>
  type?: ScheduleProps["type"]
  onlyBookmarked?: boolean
  selectedDayKey?: string
  enableSync?: boolean
  icalPrefix?: string
  icalDomain?: string
  icalFileName?: string
  binMinutes?: number
  dayChangeHour?: number
  timeZone?: string
  dayFormat?: string
  dayTitleComponent?: string
  binTitleComponent?: string
  onChangeType?: (type: ScheduleProps["type"]) => void
  onChangeOnlyBookmarked?: (onlyBookmarked: boolean) => void
  onSelectDay?: (day: Day) => void
  onShare?: () => void
  onSync?: () => void
} & StackProps

export const SchedulePage = (props: SchedulePageProps) => {
  const {
    className,
    items,
    tags = [],
    type = "daily-agenda",
    onlyBookmarked,
    selectedDayKey,
    enableSync,
    icalPrefix = "event",
    icalDomain,
    icalFileName = "schedule",
    binMinutes,
    dayChangeHour,
    timeZone,
    dayFormat,
    dayTitleComponent,
    binTitleComponent,
    onChangeType,
    onChangeOnlyBookmarked,
    onSelectDay,
    onShare,
    onSync,
    ...other
  } = useProps("SchedulePage", {}, props)

  return (
    <Stack className={clsx("SchedulePage-root", className)} {...other}>
      <Box className="SchedulePage-topMenu">
        <BookmarkFilter
          className="SchedulePage-bookmarkFilter"
          size="sm"
          value={onlyBookmarked}
          onChange={onChangeOnlyBookmarked}
        />
        <Select
          className="SchedulePage-viewSelect"
          size="sm"
          title="View"
          aria-label="view"
          data={[
            {
              value: "daily-agenda",
              label: "Daily Agenda",
            },
            {
              value: "full-agenda",
              label: "Full Agenda",
            },
            {
              value: "catalog",
              label: "Catalog",
            },
            {
              value: "tags",
              label: "Tags",
            },
          ]}
          value={type}
          allowDeselect={false}
          variant="default"
          onChange={onChangeType as (v: string | null) => void}
          leftSection={<IconEye size={18} />}
        />
        <ShareMenu
          ButtonProps={{
            className: "SchedulePage-shareButton",
          }}
          enableSync={enableSync}
          onShare={onShare}
          onSync={onSync}
          onExport={() => {
            const data = createICS(
              items.filter(isBounded),
              `schedule-${icalPrefix}`,
              icalDomain || window.location.hostname,
            )
            const blob = new Blob([data], { type: "text/calendar" })
            const dataURL = URL.createObjectURL(blob)
            const el = document.createElement("a")
            el.setAttribute("href", dataURL)
            el.setAttribute("download", `${icalFileName}.ics`)
            el.click()
            URL.revokeObjectURL(dataURL)
          }}
        />
      </Box>
      <Grid>
        <Grid.Col span={{ xs: 12, sm: 4, md: 3 }} order={{ base: 0, sm: 1 }}>
          <Stack gap="xs" align="start">
            <Filter tags={tags} />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ xs: 12, sm: 8, md: 9 }} order={{ base: 1, sm: 0 }}>
          <Schedule
            items={items}
            type={type}
            tags={tags}
            binMinutes={binMinutes}
            dayTitleComponent={dayTitleComponent}
            binTitleComponent={binTitleComponent}
            dayChangeHour={dayChangeHour}
            dayFormat={dayFormat}
            timeZone={timeZone}
            selectedDayKey={selectedDayKey}
            onSelectDay={onSelectDay}
          />
        </Grid.Col>
      </Grid>
    </Stack>
  )
}

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
  type DetailedScheduleItem,
  type ScheduleItemCollection,
} from "@open-event-systems/schedule-lib"
import clsx from "clsx"
import {
  Schedule,
  type ScheduleProps,
  type ScheduleType,
} from "../schedule/schedule.js"
import { Filter } from "../filter/filter.js"
import { IconEye, type ReactNode } from "@tabler/icons-react"
import { ShareMenu } from "../share-menu/share-menu.js"
import { BookmarkFilter } from "../bookmark-filter/bookmark-filter.js"
import { useScheduleConfig } from "../../hooks/config.js"
import type { TagEntry } from "../../types.js"

import type { ItemPillProps } from "../pill/item-pill.js"

import classes from "./schedule-page.module.scss"
import { useContext } from "react"
import { FilterContext } from "../../hooks/filter.js"

export type SchedulePageProps = {
  items: ScheduleItemCollection<DetailedScheduleItem>
  filteredItems: ScheduleItemCollection<DetailedScheduleItem>
  now?: Date
  type?: ScheduleType
  allowTypes?: Iterable<ScheduleType>
  tags?: Iterable<TagEntry>
  noPastEventsOption?: boolean
  noShareMenu?: boolean
  hideBookmarkFilter?: boolean
  enableSync?: boolean
  icalFileName?: string
  dayTitleComponent?: string
  binTitleComponent?: string
  renderPill?: (props: ItemPillProps) => ReactNode
  onChangeType?: (type: ScheduleProps["type"]) => void
  onShare?: () => void
  onSync?: () => void
} & StackProps

export const SchedulePage = (props: SchedulePageProps) => {
  const {
    className,
    items,
    filteredItems,
    now,
    type,
    allowTypes,
    tags,
    noPastEventsOption,
    noShareMenu,
    hideBookmarkFilter,
    enableSync,
    icalFileName,
    dayTitleComponent,
    binTitleComponent,
    renderPill,
    onChangeType,
    onShare,
    onSync,
    ...other
  } = useProps(
    "SchedulePage",
    {
      type: "daily-agenda",
      allowTypes: ["daily-agenda", "full-agenda", "catalog", "tags"],
      icalFileName: "schedule",
    },
    props,
  )

  const allowTypesArr = [...(allowTypes ?? [])]

  const { icalPrefix, icalDomain } = useScheduleConfig()

  const [filterState, updateFilter] = useContext(FilterContext)

  return (
    <Stack
      className={clsx("SchedulePage-root", classes.root, className)}
      {...other}
    >
      <Box className={clsx("SchedulePage-topMenu", classes.topMenu)}>
        {!hideBookmarkFilter && (
          <BookmarkFilter
            className={clsx(
              "SchedulePage-bookmarkFilter",
              classes.bookmarkFilter,
            )}
            size="sm"
            value={filterState.onlyBookmarked}
            onChange={(only) => updateFilter({ onlyBookmarked: only })}
          />
        )}
        {allowTypesArr.length > 1 && (
          <Select
            className={clsx("SchedulePage-viewSelect", classes.viewSelect)}
            size="sm"
            title="View"
            aria-label="view"
            data={(
              [
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
              ] as const
            ).filter((o) => allowTypesArr.includes(o.value))}
            value={type}
            allowDeselect={false}
            variant="default"
            onChange={onChangeType as (v: string | null) => void}
            leftSection={<IconEye size={18} />}
          />
        )}
        {!noShareMenu && (
          <ShareMenu
            ButtonProps={{
              className: clsx("SchedulePage-shareButton", classes.shareButton),
            }}
            enableSync={enableSync}
            onShare={onShare}
            onSync={onSync}
            onExport={() => {
              const data = createICS(
                filteredItems.filter(isBounded),
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
        )}
      </Box>
      <Grid>
        <Grid.Col span={{ xs: 12, sm: 4, md: 3 }} order={{ base: 0, sm: 1 }}>
          <Stack gap="xs" align="start">
            <Filter tags={tags} noPastEventsOption={noPastEventsOption} />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ xs: 12, sm: 8, md: 9 }} order={{ base: 1, sm: 0 }}>
          <Schedule
            items={items}
            filteredItems={filteredItems}
            now={now}
            type={type}
            dayTitleComponent={dayTitleComponent}
            binTitleComponent={binTitleComponent}
            renderPill={renderPill}
            selectedDayKey={filterState.selectedDayKey}
            onSelectDay={(day) => updateFilter({ selectedDayKey: day.key })}
          />
        </Grid.Col>
      </Grid>
    </Stack>
  )
}

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
import { type ScheduleProps } from "../schedule/schedule.js"
import { IconEye, type ReactNode } from "@tabler/icons-react"
import { ShareMenu } from "../share-menu/share-menu.js"
import {
  BookmarkFilter,
  type BookmarkFilterProps,
} from "../bookmark-filter/bookmark-filter.js"
import { useScheduleConfig } from "../../hooks/config.js"

import classes from "./schedule-page.module.scss"
import { memo, type NamedExoticComponent } from "react"
import { scheduleViewTypes, type ScheduleViewType } from "../../types.js"

export type SchedulePageProps = {
  filteredItems: ScheduleItemCollection<DetailedScheduleItem>
  type?: ScheduleViewType
  allowTypes?: Iterable<ScheduleViewType>
  noShareMenu?: boolean
  hideBookmarkFilter?: boolean
  enableSync?: boolean
  icalFileName?: string
  filter?: ReactNode
  bookmarkFilter?: ReactNode
  schedule?: ReactNode
  onChangeType?: (type: ScheduleProps["type"]) => void
  onShare?: () => void
  onSync?: () => void
} & StackProps

type SchedulePageComponent = NamedExoticComponent<SchedulePageProps> & {
  BookmarkFilter: typeof SchedulePageBookmarkFilter
}

/**
 * Full schedule page component.
 */
const _SchedulePage = memo((props: SchedulePageProps) => {
  const {
    className,
    filteredItems,
    type,
    allowTypes,
    noShareMenu,
    hideBookmarkFilter,
    enableSync,
    icalFileName,
    filter,
    bookmarkFilter,
    schedule,
    onChangeType,
    onShare,
    onSync,
    ...other
  } = useProps(
    "SchedulePage",
    {
      type: "daily-agenda",
      icalFileName: "schedule",
    },
    props,
  )

  const allowTypesArr = [
    ...(allowTypes ?? (Object.keys(scheduleViewTypes) as ScheduleViewType[])),
  ]

  const { icalPrefix, icalDomain } = useScheduleConfig()

  return (
    <Stack
      className={clsx("SchedulePage-root", classes.root, className)}
      {...other}
    >
      <Box className={clsx("SchedulePage-topMenu", classes.topMenu)}>
        {!hideBookmarkFilter && bookmarkFilter}
        {allowTypesArr.length > 1 && (
          <Select
            className={clsx("SchedulePage-viewSelect", classes.viewSelect)}
            size="sm"
            title="View"
            aria-label="view"
            data={allowTypesArr.map((t) => ({
              value: t,
              label: scheduleViewTypes[t],
            }))}
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
            {filter}
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ xs: 12, sm: 8, md: 9 }} order={{ base: 1, sm: 0 }}>
          {schedule}
        </Grid.Col>
      </Grid>
    </Stack>
  )
}) as Partial<SchedulePageComponent>

_SchedulePage.displayName = "SchedulePage"

export type SchedulePageBookmarkFilterProps = BookmarkFilterProps

export const SchedulePageBookmarkFilter = memo((props: BookmarkFilterProps) => (
  <BookmarkFilter
    size="sm"
    {...props}
    className={clsx(
      "SchedulePage-bookmarkFilter",
      classes.bookmarkFilter,
      props.className,
    )}
  />
))

SchedulePageBookmarkFilter.displayName = "SchedulePageBookmarkFilter"

_SchedulePage.BookmarkFilter = SchedulePageBookmarkFilter

export const SchedulePage = _SchedulePage as SchedulePageComponent

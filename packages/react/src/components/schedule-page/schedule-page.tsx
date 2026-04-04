import { Box, useProps, type StackProps } from "@mantine/core"
import clsx from "clsx"
import { type ReactNode } from "@tabler/icons-react"
import { ShareMenu, type ShareMenuProps } from "../share-menu/share-menu.js"
import {
  BookmarkFilter,
  type BookmarkFilterProps,
} from "../filters/bookmark-filter.js"

import { memo } from "react"
import { ViewSelect, type ViewSelectProps } from "../view-select/view-select.js"

import classes from "./schedule-page.module.scss"
import { TextFilter, type TextFilterProps } from "../filters/text-filter.js"
import {
  PastEventsFilter,
  type PastEventsFilterProps,
} from "../filters/past-events-filter.js"
import { TagFilter, type TagFilterProps } from "../filters/tag-filter.js"
import { useMediaQuery } from "@mantine/hooks"
import { iterToArr } from "../../utils.js"

export type SchedulePageProps = {
  viewOptions?: Iterable<Readonly<{ value: string; label: string }>>
  // TODO: combine into features array
  hideShareMenu?: boolean
  hideBookmarkFilter?: boolean
  hideShowPastEventsFilter?: boolean
  enableSync?: boolean
  renderBookmarkFilter?: (props: BookmarkFilterProps) => ReactNode
  renderViewSelect?: (props: ViewSelectProps) => ReactNode
  renderTextFilter?: (props: TextFilterProps) => ReactNode
  renderPastEventsFilter?: (props: PastEventsFilterProps) => ReactNode
  renderTagFilter?: (props: TagFilterProps) => ReactNode
  renderShare?: (props: ShareMenuProps) => ReactNode
  renderSchedule?: (props: object) => ReactNode
  onShare?: () => void
  onSync?: () => void
} & StackProps

/**
 * Full schedule page component.
 */
export const SchedulePage = memo((props: SchedulePageProps) => {
  const {
    className,
    viewOptions,
    hideShareMenu,
    hideBookmarkFilter,
    hideShowPastEventsFilter,
    renderBookmarkFilter,
    renderViewSelect,
    renderTextFilter,
    renderPastEventsFilter,
    renderTagFilter,
    renderShare,
    renderSchedule,
    ...other
  } = useProps(
    "SchedulePage",
    {
      renderBookmarkFilter: () => <BookmarkFilter />,
      renderViewSelect: () => <ViewSelect />,
      renderTextFilter: () => <TextFilter />,
      renderPastEventsFilter: () => <PastEventsFilter />,
      renderTagFilter: () => <TagFilter />,
      renderShare: () => <ShareMenu />,
      renderSchedule: () => null,
    } as const,
    props,
  )

  const viewOptsArr = iterToArr(viewOptions)

  const isSmall = useMediaQuery("(max-width: 48rem)")
  const viewSelect =
    viewOptsArr.length > 1 &&
    renderViewSelect({
      className: clsx("SchedulePage-viewSelect", classes.viewSelect),
      data: viewOptsArr,
    })
  const bookmarkFilter =
    !hideBookmarkFilter &&
    renderBookmarkFilter({
      className: clsx("SchedulePage-bookmarkFilter", classes.bookmarkFilter),
    })
  const shareMenu =
    !hideShareMenu &&
    renderShare({
      ButtonProps: {
        className: clsx("SchedulePage-shareButton", classes.shareButton),
      },
    })
  const textFilter = renderTextFilter({
    className: clsx("SchedulePage-textFilter", classes.textFilter),
  })
  const pastEventsFilter =
    !hideShowPastEventsFilter &&
    renderPastEventsFilter({
      className: clsx("SchedulePage-pastEventsFilter"),
    })
  const tagFilter = renderTagFilter({
    className: clsx("SchedulePage-tagFilter"),
  })
  const schedule = renderSchedule({})

  let content

  if (isSmall) {
    content = (
      <>
        <Box className={clsx(classes.toolbar)}>
          {viewSelect}
          {shareMenu}
        </Box>
        <Box className={clsx(classes.toolbar)}>{bookmarkFilter}</Box>
        <Box className={clsx(classes.toolbar)}>{textFilter}</Box>
        <Box className={clsx(classes.toolbar)}>{pastEventsFilter}</Box>
        <Box className={clsx(classes.toolbar)}>{tagFilter}</Box>
        <Box className={clsx("SchedulePage-schedule", classes.schedule)}>
          {schedule}
        </Box>
      </>
    )
  } else {
    content = (
      <>
        <Box
          className={clsx(
            "SchedulePage-topMenu",
            classes.topMenu,
            classes.leftToolbar,
          )}
        >
          {viewSelect}
          {bookmarkFilter}
        </Box>
        <Box
          className={clsx(
            "SchedulePage-topFilter",
            classes.topFilter,
            classes.toolbar,
          )}
        >
          {textFilter}
          {shareMenu}
        </Box>
        <Box className={clsx("SchedulePage-filter", classes.filter)}>
          {pastEventsFilter}
          {tagFilter}
        </Box>
        <Box
          component="section"
          aria-label="schedule items"
          className={clsx("SchedulePage-schedule", classes.schedule)}
        >
          {schedule}
        </Box>
      </>
    )
  }

  return (
    <Box
      component="section"
      aria-label="schedule and settings"
      className={clsx("SchedulePage-root", classes.root, className)}
      {...other}
    >
      {content}
    </Box>
  )
})

SchedulePage.displayName = "SchedulePage"

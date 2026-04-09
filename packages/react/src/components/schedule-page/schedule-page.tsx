import { Box, useProps, type StackProps } from "@mantine/core"
import clsx from "clsx"
import { type ReactNode } from "@tabler/icons-react"
import {
  ShareMenu,
  shareMenuOptions,
  type ShareMenuOption,
  type ShareMenuProps,
} from "../share-menu/share-menu.js"
import {
  BookmarkFilter,
  type BookmarkFilterProps,
} from "../filters/bookmark-filter.js"

import { memo, useMemo } from "react"
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
import type { TagEntry } from "../../types.js"

export const schedulePageFeatures = [
  ...shareMenuOptions,
  "bookmark-filter",
  "past-events-filter",
] as const

export type SchedulePageFeature = (typeof schedulePageFeatures)[number]

export type SchedulePageProps = {
  viewOptions?: Iterable<Readonly<{ value: string; label: string }>>
  enableFeatures?: Iterable<SchedulePageFeature>
  tags?: Iterable<TagEntry>
  renderBookmarkFilter?: (props: BookmarkFilterProps) => ReactNode
  renderViewSelect?: (props: ViewSelectProps) => ReactNode
  renderTextFilter?: (props: TextFilterProps) => ReactNode
  renderPastEventsFilter?: (props: PastEventsFilterProps) => ReactNode
  renderTagFilter?: (props: TagFilterProps) => ReactNode
  renderShare?: (props: ShareMenuProps) => ReactNode
  renderSchedule?: (props: object) => ReactNode
} & StackProps

/**
 * Full schedule page component.
 */
export const SchedulePage = memo((props: SchedulePageProps) => {
  const {
    className,
    viewOptions,
    enableFeatures,
    tags,
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
      enableFeatures: schedulePageFeatures,
      renderBookmarkFilter: (props: BookmarkFilterProps) => (
        <BookmarkFilter {...props} />
      ),
      renderViewSelect: (props: ViewSelectProps) => <ViewSelect {...props} />,
      renderTextFilter: (props: TextFilterProps) => <TextFilter {...props} />,
      renderPastEventsFilter: (props: PastEventsFilterProps) => (
        <PastEventsFilter {...props} />
      ),
      renderTagFilter: (props: TagFilterProps) => <TagFilter {...props} />,
      renderShare: (props: ShareMenuProps) => <ShareMenu {...props} />,
      renderSchedule: () => null,
    } as const,
    props,
  )

  const viewOptsArr = iterToArr(viewOptions)
  const enableFeaturesArr = iterToArr(enableFeatures)
  const shareOptsArr: ShareMenuOption[] = []

  if (enableFeaturesArr.includes("share")) {
    shareOptsArr.push("share")
  }
  if (enableFeaturesArr.includes("sync")) {
    shareOptsArr.push("sync")
  }
  if (enableFeaturesArr.includes("export")) {
    shareOptsArr.push("export")
  }

  const tagsArr = useMemo(() => iterToArr(tags), [tags])

  const isSmall = useMediaQuery("(max-width: 48rem)")
  const viewSelect =
    viewOptsArr.length > 1 &&
    renderViewSelect({
      className: clsx("SchedulePage-viewSelect", classes.viewSelect),
      data: viewOptsArr,
    })
  const bookmarkFilter =
    enableFeaturesArr.includes("bookmark-filter") &&
    renderBookmarkFilter({
      className: clsx("SchedulePage-bookmarkFilter", classes.bookmarkFilter),
    })
  const shareMenu =
    shareOptsArr.length > 0 &&
    renderShare({
      ButtonProps: {
        className: clsx("SchedulePage-shareButton", classes.shareButton),
      },
      enabledOptions: shareOptsArr,
    })
  const textFilter = renderTextFilter({
    className: clsx("SchedulePage-textFilter", classes.textFilter),
  })
  const pastEventsFilter =
    enableFeaturesArr.includes("past-events-filter") &&
    renderPastEventsFilter({
      className: clsx("SchedulePage-pastEventsFilter"),
    })
  const tagFilter =
    tagsArr.length > 0 &&
    renderTagFilter({
      className: clsx("SchedulePage-tagFilter"),
      tags: tagsArr,
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

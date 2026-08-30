import { Badge, Box, Button, useProps, type ButtonProps } from "@mantine/core"
import type { DefaultBoxProps } from "../types.js"
import clsx from "clsx"

import classes from "./schedule-page.module.scss"
import {
  ShareMenuOption,
  ShareMenuOptionNames,
  type ShareMenuProps,
} from "../share-menu/share-menu.js"
import type { ReactNode } from "react"
import { useMediaQuery } from "@mantine/hooks"
import { FunnelIcon } from "@phosphor-icons/react/dist/icons/Funnel"
import { FilterDialog } from "../filters/filter-dialog.js"
import type { ViewSelectProps } from "../view-select/view-select.js"
import type { SelectionsFilterProps } from "../filters/selections-filter.js"
import type { TagFilterProps, TagFilterTagData } from "../filters/tag-filter.js"
import { useSchedulePageFeatures } from "./hooks.js"

export const SchedulePageFeature = {
  ...ShareMenuOption,
  search: "search",
  tagFilter: "tag-filter",
  bookmarkedFilter: "bookmarked-filter",
  unvisitedFilter: "unvisited-filter",
  pastEventsFilter: "past-events-filter",
} as const

export type SchedulePageFeature =
  (typeof SchedulePageFeature)[keyof typeof SchedulePageFeature]

export const SchedulePageFeatureNames = {
  ...ShareMenuOptionNames,
  search: "Search",
  "tag-filter": "Tag filter",
  "bookmarked-filter": "Bookmarked filter",
  "unvisited-filter": "Unvisited filter",
  "past-events-filter": "Past events filter",
} as const satisfies { readonly [K in SchedulePageFeature]: string }

export type SchedulePageProps = {
  enabledFeatures?: Iterable<SchedulePageFeature>

  viewSelectOptions?: ViewSelectProps["data"]
  renderViewSelect?: (props: ViewSelectProps) => ReactNode

  renderSelectionsFilter?: (props: SelectionsFilterProps) => ReactNode

  textFilter?: ReactNode

  renderShareMenu?: (props: ShareMenuProps) => ReactNode

  pastEventsFilter?: ReactNode

  tags?: Iterable<string | TagFilterTagData>
  renderTagFilter?: (props: TagFilterProps) => ReactNode

  filterCount?: number

  filterDialogOpen: boolean
  onCloseFilterDialog: () => void
  onOpenFilterDialog?: () => void
} & SchedulePageRootProps

const _SchedulePage = (props: SchedulePageProps) => {
  const {
    children,
    enabledFeatures,
    viewSelectOptions,
    renderViewSelect,
    renderSelectionsFilter,
    textFilter,
    renderShareMenu,
    pastEventsFilter,
    tags,
    renderTagFilter,
    filterCount,
    filterDialogOpen,
    onCloseFilterDialog,
    onOpenFilterDialog,
    ...other
  } = useProps("SchedulePage", null, props)

  const small = useMediaQuery("(max-width: 800px)")

  const {
    shareMenuOptions,
    selectionsFilterOptions,
    showPastEventsFilter,
    showSearch,
    showSelectionsFilter,
    showShareMenu,
    showTagFilter,
    showViewSelect,
  } = useSchedulePageFeatures({
    enabledFeatures,
    tags,
    viewSelectOptions,
  })

  const viewSelectEl =
    showViewSelect &&
    renderViewSelect &&
    renderViewSelect({
      data: viewSelectOptions,
      size: small ? "xs" : "sm",
      fixedWidth: small ? false : true,
    })
  const selectionsFilterEl =
    showSelectionsFilter &&
    renderSelectionsFilter &&
    renderSelectionsFilter({ enableOptions: selectionsFilterOptions, small })
  const shareMenuEl =
    showShareMenu &&
    renderShareMenu &&
    renderShareMenu({ enabledOptions: shareMenuOptions, small })
  const tagFilterEl =
    showTagFilter && renderTagFilter && renderTagFilter({ tags })
  const textFilterEl = showSearch && textFilter
  const pastEventsFilterEl = showPastEventsFilter && pastEventsFilter

  let content

  if (small) {
    const showFilterButton = textFilterEl || pastEventsFilterEl || tagFilterEl

    content = (
      <>
        <SchedulePage.Toolbar stretch>
          <SchedulePage.ToolbarRow expandFirst>
            {viewSelectEl}
            {!showFilterButton && shareMenuEl}
          </SchedulePage.ToolbarRow>
          <SchedulePage.ToolbarRow expandFirst>
            {selectionsFilterEl}
          </SchedulePage.ToolbarRow>
          {showFilterButton && (
            <SchedulePage.ToolbarRow spaceBetween>
              <SchedulePage.FilterButton
                filterCount={filterCount}
                onClick={onOpenFilterDialog}
              />
              {shareMenuEl}
            </SchedulePage.ToolbarRow>
          )}
        </SchedulePage.Toolbar>
        <SchedulePage.Content>{children}</SchedulePage.Content>
        <FilterDialog opened={filterDialogOpen} onClose={onCloseFilterDialog}>
          {textFilterEl}
          {pastEventsFilterEl}
          {tagFilterEl}
        </FilterDialog>
      </>
    )
  } else {
    let cornerContent

    if (textFilterEl) {
      cornerContent = (
        <SchedulePage.ToolbarRow expandFirst>
          {textFilterEl}
          {shareMenuEl}
        </SchedulePage.ToolbarRow>
      )
    } else {
      cornerContent = (
        <SchedulePage.ToolbarRow rightJustify>
          {shareMenuEl}
        </SchedulePage.ToolbarRow>
      )
    }

    content = (
      <>
        <SchedulePage.Toolbar>
          <SchedulePage.ToolbarRow>
            {viewSelectEl}
            {selectionsFilterEl}
          </SchedulePage.ToolbarRow>
        </SchedulePage.Toolbar>
        {cornerContent && (
          <SchedulePage.Corner>{cornerContent}</SchedulePage.Corner>
        )}
        <SchedulePage.Sidebar>
          {pastEventsFilterEl}
          {tagFilterEl}
        </SchedulePage.Sidebar>
        <SchedulePage.Content>{children}</SchedulePage.Content>
      </>
    )
  }

  return (
    <SchedulePage.Root small={small} {...other}>
      {content}
    </SchedulePage.Root>
  )
}

export type SchedulePageRootProps = { small?: boolean } & DefaultBoxProps

export const SchedulePageRoot = (props: SchedulePageRootProps) => {
  const { className, small, ...other } = useProps(
    "SchedulePageRoot",
    null,
    props,
  )

  return (
    <Box
      className={clsx(
        "SchedulePage-root",
        classes.root,
        small && classes.small,
        className,
      )}
      {...other}
    />
  )
}

export type SchedulePageToolbarProps = { stretch?: boolean } & DefaultBoxProps

export const SchedulePageToolbar = (props: SchedulePageToolbarProps) => {
  const { className, stretch, ...other } = useProps(
    "SchedulePageToolbar",
    null,
    props,
  )

  return (
    <Box
      className={clsx(
        "SchedulePage-toolbar",
        classes.toolbar,
        stretch && classes.stretch,
        className,
      )}
      {...other}
    />
  )
}

export type SchedulePageToolbarRowProps = {
  expandFirst?: boolean
  rightJustify?: boolean
  spaceBetween?: boolean
} & DefaultBoxProps

export const SchedulePageToolbarRow = (props: SchedulePageToolbarRowProps) => {
  const { className, expandFirst, rightJustify, spaceBetween, ...other } =
    useProps("SchedulePageToolbarRow", null, props)

  return (
    <Box
      className={clsx(
        "SchedulePage-toolbarRow",
        classes.toolbarRow,
        expandFirst && classes.expandFirst,
        rightJustify && classes.rightJustify,
        spaceBetween && classes.spaceBetween,
        className,
      )}
      {...other}
    />
  )
}

export type SchedulePageFilterButtonProps = {
  filterCount?: number
} & ButtonProps &
  DefaultBoxProps<"button">

export const SchedulePageFilterButton = (
  props: SchedulePageFilterButtonProps,
) => {
  const { className, filterCount, ...other } = useProps(
    "SchedulePageFilterButton",
    null,
    props,
  )

  return (
    <Button
      className={clsx("SchedulePage-filterButton", className)}
      variant="subtle"
      size="xs"
      leftSection={<FunnelIcon size={20} />}
      rightSection={
        filterCount && filterCount > 0 ? (
          <Badge circle variant="light">
            {filterCount}
          </Badge>
        ) : undefined
      }
      {...other}
    >
      Filter
    </Button>
  )
}

export type SchedulePageSidebarProps = DefaultBoxProps

export const SchedulePageSidebar = (props: SchedulePageSidebarProps) => {
  const { className, ...other } = useProps("SchedulePageSidebar", null, props)

  return (
    <Box
      className={clsx("SchedulePage-sidebar", classes.sidebar, className)}
      {...other}
    />
  )
}

export type SchedulePageCornerProps = DefaultBoxProps

export const SchedulePageCorner = (props: SchedulePageCornerProps) => {
  const { className, ...other } = useProps("SchedulePageCorner", null, props)

  return (
    <Box
      className={clsx("SchedulePage-corner", classes.corner, className)}
      {...other}
    />
  )
}

export type SchedulePageContentProps = DefaultBoxProps

export const SchedulePageContent = (props: SchedulePageContentProps) => {
  const { className, ...other } = useProps("SchedulePageContent", null, props)

  return (
    <Box
      className={clsx("SchedulePage-content", classes.content, className)}
      {...other}
    />
  )
}

export const SchedulePage = Object.assign(_SchedulePage, {
  Root: SchedulePageRoot,
  Sidebar: SchedulePageSidebar,
  Toolbar: SchedulePageToolbar,
  ToolbarRow: SchedulePageToolbarRow,
  FilterButton: SchedulePageFilterButton,
  Corner: SchedulePageCorner,
  Content: SchedulePageContent,
})

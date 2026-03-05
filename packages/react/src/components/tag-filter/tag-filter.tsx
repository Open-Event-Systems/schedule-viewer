import { Stack, useProps, type StackProps } from "@mantine/core"
import clsx from "clsx"
import {
  memo,
  useCallback,
  useMemo,
  type NamedExoticComponent,
  type ReactNode,
} from "react"
import type { TagEntry, TagIndicatorEntry } from "../../types.js"
import { getItemPillTagClassName } from "../pill/item-pill-utils.js"
import { makeTagIndicatorFunc } from "../../config.js"
import { Pills, type PillProps, type PillsProps } from "../pill/pills.js"

import classes from "./tag-filter.module.scss"

export type TagFilterProps = {
  classNames?: {
    root?: string
    tags?: string
    tag?: string
  }

  /**
   * The set of tags that have been disabled.
   */
  disabledTags?: Iterable<string>

  /**
   * A collection of {@link TagEntry} objects representing the displayable tags.
   */
  tags?: Iterable<TagEntry>

  /**
   * A collection of {@link TagIndicatorEntry} objects.
   */
  tagIndicators?: Iterable<TagIndicatorEntry>

  /**
   * Handler to set a tag disabled/enabled.
   */
  onSetDisabled?: (tag: string, disabled: boolean) => void

  /**
   * Function to render a tag.
   */
  renderTag?: (props: TagFilterTagProps) => ReactNode
} & TagFilterRootProps

type TagFilterComponent = NamedExoticComponent<TagFilterProps> & {
  Root: typeof TagFilterRoot
  Tags: typeof TagFilterTags
  Tag: typeof TagFilterTag
}

/**
 * Tag filter component.
 */
const _TagFilter = memo((props: TagFilterProps) => {
  const {
    className,
    classNames,
    disabledTags,
    tags,
    tagIndicators,
    onSetDisabled,
    renderTag,
    ...other
  } = useProps("TagFilter", {}, props)

  const tagIndicatorFunc = useMemo(
    () => makeTagIndicatorFunc(tagIndicators ?? []),
    [tagIndicators],
  )

  return (
    <TagFilter.Root className={clsx(className, classNames?.root)} {...other}>
      <TagFilter.Tags
        className={classNames?.tags}
        tags={tags}
        disabledTags={disabledTags}
        onSetDisabled={onSetDisabled}
        getIndicator={tagIndicatorFunc}
        renderTag={renderTag}
      />
    </TagFilter.Root>
  )
}) as Partial<TagFilterComponent>

_TagFilter.displayName = "TagFilter"

export type TagFilterRootProps = StackProps

export const TagFilterRoot = memo((props: TagFilterRootProps) => {
  const { className, ...other } = useProps("TagFilterRoot", {}, props)

  return <Stack className={clsx("TagFilter-root", className)} {...other} />
})

TagFilterRoot.displayName = "TagFilter.Root"

export type TagFilterTagsProps = {
  disabledTags?: Iterable<string>
  tags?: Iterable<TagEntry>
  getIndicator?: (tags: Iterable<string>) => string | undefined
  onSetDisabled?: (tag: string, enabled: boolean) => void
  renderTag?: (props: TagFilterTagProps) => ReactNode
} & PillsProps

export const TagFilterTags = memo((props: TagFilterTagsProps) => {
  const {
    disabledTags,
    tags,
    getIndicator,
    onSetDisabled,
    className,
    renderTag,
    ...other
  } = useProps("TagFilterTags", {}, props)

  const disabledTagsSet = useMemo(() => {
    if (disabledTags instanceof Set) {
      return disabledTags
    } else {
      return new Set(disabledTags)
    }
  }, [disabledTags])

  const defaultRenderTag = useCallback(
    (props: TagFilterTagProps) => {
      return (
        <TagFilter.Tag
          key={props.tag}
          disabled={disabledTagsSet.has(props.tag)}
          {...props}
        />
      )
    },
    [disabledTagsSet],
  )

  const renderTagFunc = renderTag ?? defaultRenderTag

  return (
    <Pills className={clsx("TagFilter-tags", className)} {...other}>
      {Array.from(tags ?? [], (t) =>
        renderTagFunc({
          tag: t.tag,
          title: t.title,
          ...(getIndicator && {
            indicator: getIndicator([t.tag]),
          }),
          ...(onSetDisabled && {
            onSetDisabled: (d) => onSetDisabled(t.tag, d),
          }),
        }),
      )}
    </Pills>
  )
})

TagFilterTags.displayName = "TagFilter.Tags"

export type TagFilterTagProps = {
  tag: string
  title?: string
  disabled?: boolean
  indicator?: string
  onSetDisabled?: (disabled: boolean) => void
} & PillProps

export const TagFilterTag = memo((props: TagFilterTagProps) => {
  const {
    tag,
    title,
    disabled,
    onSetDisabled,
    className,
    classNames,
    ...other
  } = useProps("TagFilterTag", {}, props)

  return (
    <Pills.Pill
      button
      className={clsx(
        "TagFilter-tag",
        classes.tag,
        disabled && ["TagFilter-disabled", classes.disabled],
        getItemPillTagClassName(tag),
        className,
      )}
      classNames={{
        ...classNames,
        body: clsx("TagFilter-pillBody", classes.pillBody, classNames?.body),
      }}
      onClick={() => {
        onSetDisabled && onSetDisabled(!disabled)
      }}
      {...other}
    >
      {title || tag}
    </Pills.Pill>
  )
})

TagFilterTag.displayName = "TagFilter.Tag"

_TagFilter.Root = TagFilterRoot
_TagFilter.Tags = TagFilterTags
_TagFilter.Tag = TagFilterTag

export const TagFilter = _TagFilter as TagFilterComponent

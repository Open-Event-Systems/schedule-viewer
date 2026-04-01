import { Stack, Text, useProps, type StackProps } from "@mantine/core"
import clsx from "clsx"
import {
  memo,
  useCallback,
  useMemo,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react"
import type { TagEntry, TagIndicatorEntry } from "../../types.js"
import { getItemPillTagClassName } from "../pill/item-pill-utils.js"
import { makeTagIndicatorFunc } from "../../config.js"
import { Pills, type PillProps, type PillsProps } from "../pill/pills.js"

import classes from "./tag-filter.module.scss"
import { useId } from "@mantine/hooks"

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
} & StackProps &
  ComponentPropsWithoutRef<"section">

/**
 * Tag filter component.
 */
export const TagFilter = memo((props: TagFilterProps) => {
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

  const textId = useId()

  return (
    <Stack
      component="section"
      className={clsx("TagFilter-root", classNames?.root, className)}
      gap={4}
      aria-labelledby={textId}
      {...other}
    >
      <Text span id={textId} size="xs" c="dimmed">
        Filter Tags
      </Text>
      <TagFilterTags
        className={classNames?.tags}
        tags={tags}
        disabledTags={disabledTags}
        onSetDisabled={onSetDisabled}
        getIndicator={tagIndicatorFunc}
        renderTag={renderTag}
      />
    </Stack>
  )
})

TagFilter.displayName = "TagFilter"

type TagFilterTagsProps = {
  disabledTags?: Iterable<string>
  tags?: Iterable<TagEntry>
  getIndicator?: (tags: Iterable<string>) => string | undefined
  onSetDisabled?: (tag: string, enabled: boolean) => void
  renderTag?: (props: TagFilterTagProps) => ReactNode
} & PillsProps

const TagFilterTags = memo((props: TagFilterTagsProps) => {
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
        <TagFilterTag
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
    <Pills
      className={clsx("TagFilter-tags", className)}
      renderContent={(props) => <menu {...props} />}
      {...other}
    >
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

type TagFilterTagProps = {
  tag: string
  title?: string
  disabled?: boolean
  indicator?: string
  onSetDisabled?: (disabled: boolean) => void
} & PillProps

const TagFilterTag = memo((props: TagFilterTagProps) => {
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
      onClickBody={() => {
        onSetDisabled && onSetDisabled(!disabled)
      }}
      renderBody={(props) => (
        <button
          role="switch"
          aria-checked={!disabled}
          {...props}
          type="button"
        />
      )}
      {...other}
    >
      {title || tag}
    </Pills.Pill>
  )
})

TagFilterTag.displayName = "TagFilter.Tag"

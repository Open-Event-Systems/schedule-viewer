import { Stack, useProps, type StackProps } from "@mantine/core"
import clsx from "clsx"
import { memo, useMemo, type NamedExoticComponent, type ReactNode } from "react"
import type { TagEntry, TagIndicatorEntry } from "../../types.js"

import { Pill, type PillBinProps, type PillProps } from "../pill/pill.js"
import { getItemPillTagClassName } from "../pill/item-pill-utils.js"
import { makeTagIndicatorFunc } from "../../config.js"

import classes from "./tag-filter.module.scss"
import type { ReadonlyBasicSet } from "../../utils/basic-set.js"

export type TagFilterProps = {
  classNames?: {
    root?: string
    tags?: string
    tag?: string
  }
  disabledTags?: ReadonlyBasicSet<string>
  tags?: Iterable<TagEntry>
  tagIndicators?: readonly TagIndicatorEntry[]
  onSetDisabled?: (tag: string, disabled: boolean) => void
  renderTag?: (props: TagFilterTagProps) => ReactNode
} & TagFilterRootProps

type TagFilterComponentType = NamedExoticComponent<TagFilterProps> & {
  Root: typeof Root
  Tags: typeof Tags
  Tag: typeof Tag
}

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
}) as Partial<TagFilterComponentType>

_TagFilter.displayName = "TagFilter"

export type TagFilterRootProps = {} & StackProps

const Root = memo((props: TagFilterRootProps) => {
  const { className, ...other } = useProps("TagFilterRoot", {}, props)

  return <Stack className={clsx("TagFilter-root", className)} {...other} />
})

Root.displayName = "TagFilter.Root"

export type TagFilterTagsProps = {
  disabledTags?: ReadonlyBasicSet<string>
  tags?: Iterable<TagEntry>
  getIndicator?: (tags: Iterable<string>) => string | undefined
  onSetDisabled?: (tag: string, enabled: boolean) => void
  renderTag?: (props: TagFilterTagProps) => ReactNode
} & PillBinProps

const Tags = memo((props: TagFilterTagsProps) => {
  const defaultRenderTag = (props: TagFilterTagProps) => {
    return (
      <TagFilter.Tag
        key={props.tag}
        disabled={disabledTags.has(props.tag)}
        {...props}
      />
    )
  }

  const {
    disabledTags,
    tags,
    getIndicator,
    onSetDisabled,
    className,
    renderTag,
    ...other
  } = useProps(
    "TagFilterTags",
    {
      disabledTags: new Set<string>(),
      tags: [],
      renderTag: defaultRenderTag,
    },
    props,
  )

  return (
    <Pill.Bin className={clsx("TagFilter-tags", className)} {...other}>
      {Array.from(tags, (t) =>
        renderTag({
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
    </Pill.Bin>
  )
})

Tags.displayName = "TagFilter.Tags"

export type TagFilterTagProps = {
  tag: string
  title?: string
  disabled?: boolean
  indicator?: string
  onSetDisabled?: (disabled: boolean) => void
} & PillProps

const Tag = memo((props: TagFilterTagProps) => {
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
    <Pill
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
    </Pill>
  )
})

Tag.displayName = "TagFilter.Tag"

_TagFilter.Root = Root
_TagFilter.Tags = Tags
_TagFilter.Tag = Tag

export const TagFilter = _TagFilter as TagFilterComponentType

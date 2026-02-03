import { useProps } from "@mantine/core"
import clsx from "clsx"
import { useMemo, type ReactNode } from "react"
import { Pills, type PillsProps } from "../pills/pills.js"
import { makeTagIndicatorFunc } from "../../config.js"
import type { TagEntry, TagIndicatorEntry } from "../../types.js"

import classes from "./tag-filter.module.scss"

export type TagFilterProps = {
  disabledTags?: ReadonlySet<string>
  tags?: Iterable<TagEntry>
  tagIndicators?: readonly TagIndicatorEntry[]
  onChangeTags?: (tags: ReadonlySet<string>) => void
} & PillsProps

export const TagFilter = (props: TagFilterProps) => {
  const {
    className,
    disabledTags = new Set<string>(),
    tags = [],
    tagIndicators = [],
    onChangeTags,
    ...other
  } = useProps("TagFilter", {}, props)

  const getIndicator = useMemo(() => {
    return makeTagIndicatorFunc(tagIndicators)
  }, [tagIndicators])

  const tagEls = []
  for (const tag of tags) {
    tagEls.push(
      <TagFilterTag
        key={tag.tag}
        tag={tag.tag}
        title={tag.title}
        disabledTags={disabledTags}
        getIndicator={getIndicator}
        onChangeTags={onChangeTags}
      />,
    )
  }

  return (
    <Pills.Root
      className={clsx("TagFilter-root", classes.root, className)}
      {...other}
    >
      <Pills.Bin menu>{tagEls}</Pills.Bin>
    </Pills.Root>
  )
}

const TagFilterTag = ({
  tag,
  title,
  disabledTags,
  getIndicator,
  onChangeTags,
}: {
  tag: string
  title?: string
  disabledTags?: ReadonlySet<string>
  getIndicator?: (tags: ReadonlySet<string>) => ReactNode
  onChangeTags?: (tags: ReadonlySet<string>) => void
}) => {
  const enabled = !disabledTags?.has(tag)

  return (
    <Pills.Pill
      className={clsx(
        "TagFilter-tag",
        classes.tag,
        {
          "TagFilter-disabled": !enabled,
          [`${classes.disabled}`]: !enabled,
        },
        `Pill-item-tag-${tag}`,
      )}
      classNames={{
        body: clsx("TagFilter-pillBody", classes.pillBody),
      }}
      button
      indicator={getIndicator && getIndicator(new Set([tag]))}
      onClick={() => {
        const newSet = new Set(disabledTags)
        if (enabled) {
          newSet.add(tag)
        } else {
          newSet.delete(tag)
        }
        onChangeTags && onChangeTags(newSet)
      }}
    >
      {title}
    </Pills.Pill>
  )
}

TagFilter.Tag = TagFilterTag

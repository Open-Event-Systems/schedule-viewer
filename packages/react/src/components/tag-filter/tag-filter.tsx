import { useProps } from "@mantine/core"
import clsx from "clsx"
import { useMemo, type ReactNode } from "react"
import { Pills, type PillsProps } from "../pills/pills.js"
import {
  makeTagIndicatorFunc,
  type TagEntry,
  type TagIndicatorEntry,
} from "../../config/config.js"

export type TagFilterProps = {
  disabledTags?: Iterable<string>
  tags?: Iterable<TagEntry>
  tagIndicators?: readonly TagIndicatorEntry[]
  onChangeTags?: (tags: Set<string>) => void
} & PillsProps

export const TagFilter = (props: TagFilterProps) => {
  const {
    className,
    disabledTags = [],
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
    <Pills.Root {...other}>
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
  disabledTags?: Iterable<string>
  getIndicator?: (tags: Iterable<string>) => ReactNode
  onChangeTags?: (tags: Set<string>) => void
}) => {
  const disabledTagsSet = new Set(disabledTags)
  const enabled = !disabledTagsSet.has(tag)

  return (
    <Pills.Pill
      className={clsx(
        "TagFilter-tag",
        { "TagFilter-disabled": !enabled },
        `Pill-item-tag-${tag}`,
      )}
      button
      indicator={getIndicator && getIndicator([tag])}
      onClick={() => {
        const newSet = new Set(disabledTagsSet)
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

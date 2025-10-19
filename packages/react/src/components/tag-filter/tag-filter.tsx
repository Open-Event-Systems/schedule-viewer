import { useProps } from "@mantine/core"
import clsx from "clsx"
import { useMemo } from "react"
import { Pills, PillsProps } from "../pills/pills.js"
import {
  makeTagIndicatorFunc,
  TagEntry,
  TagIndicatorEntry,
} from "../../config/config.js"

export type TagFilterProps = {
  disabledTags?: Iterable<string>
  tags?: readonly TagEntry[]
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

  const disabledTagsSet = new Set(disabledTags)
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
        disabledTagsSet={disabledTagsSet}
        getIndicator={getIndicator}
        onChangeTags={onChangeTags}
      />,
    )
  }

  return (
    <Pills {...other}>
      <Pills.Bin menu>{tagEls}</Pills.Bin>
    </Pills>
  )
}

const TagFilterTag = ({
  tag,
  title: name,
  disabledTagsSet,
  getIndicator,
  onChangeTags,
}: {
  tag: string
  title: string
  disabledTagsSet: Set<string>
  getIndicator?: (tags: readonly string[]) => string | undefined
  onChangeTags?: (tags: Set<string>) => void
}) => {
  const enabled = !disabledTagsSet.has(tag)

  return (
    <Pills.Pill
      className={clsx(
        "TagFilter-tag",
        { "TagFilter-disabled": !enabled },
        `Pill-event-tag-${tag}`,
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
      {name}
    </Pills.Pill>
  )
}

TagFilter.Tag = TagFilterTag

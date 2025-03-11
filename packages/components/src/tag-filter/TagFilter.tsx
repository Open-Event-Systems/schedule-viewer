import { useProps } from "@mantine/core"
import clsx from "clsx"
import { Pills, PillsProps } from "../pills/Pills.js"
import { makeId } from "@open-event-systems/schedule-lib"
import { getIndicator } from "../pills/EventPills.js"
import { useScheduleConfig } from "../config/context.js"

export type TagFilterProps = {
  tags?: Iterable<string>
  disabledTags?: Iterable<string>
  onChangeTags?: (tags: Set<string>) => void
} & PillsProps

export const TagFilter = (props: TagFilterProps) => {
  const {
    className,
    tags = [],
    disabledTags = [],
    onChangeTags,
    ...other
  } = useProps("TagFilter", {}, props)

  const disabledTagsSet = new Set(disabledTags)

  const tagEls = []
  for (const tag of tags) {
    tagEls.push(
      <TagFilterTag
        key={tag}
        tag={tag}
        disabledTagsSet={disabledTagsSet}
        onChangeTags={onChangeTags}
      />,
    )
  }

  return (
    <Pills {...other}>
      <Pills.Bin>{tagEls}</Pills.Bin>
    </Pills>
  )
}

const TagFilterTag = ({
  tag,
  disabledTagsSet,
  onChangeTags,
}: {
  tag: string
  disabledTagsSet: Set<string>
  onChangeTags?: (tags: Set<string>) => void
}) => {
  const enabled = !disabledTagsSet.has(tag)
  const config = useScheduleConfig()

  return (
    <Pills.Pill
      className={clsx(
        "TagFilter-tag",
        { "TagFilter-disabled": !enabled },
        `Pill-event-tag-${makeId(tag)}`,
      )}
      button
      indicator={getIndicator(config.tagIndicators, [tag])}
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
      {tag}
    </Pills.Pill>
  )
}

TagFilter.Tag = TagFilterTag

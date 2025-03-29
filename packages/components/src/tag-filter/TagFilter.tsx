import { useProps } from "@mantine/core"
import clsx from "clsx"
import { Pills, PillsProps } from "../pills/Pills.js"
import { makeTagIndicatorFunc, useScheduleConfig } from "../config/context.js"
import { useMemo } from "react"

export type TagFilterProps = {
  disabledTags?: Iterable<string>
  onChangeTags?: (tags: Set<string>) => void
} & PillsProps

export const TagFilter = (props: TagFilterProps) => {
  const {
    className,
    disabledTags = [],
    onChangeTags,
    ...other
  } = useProps("TagFilter", {}, props)

  const disabledTagsSet = new Set(disabledTags)
  const config = useScheduleConfig()
  const getIndicator = useMemo(() => {
    return makeTagIndicatorFunc(config.tagIndicators)
  }, [config.tagIndicators])

  const tagEls = []
  for (const [tag, name] of config.tags) {
    tagEls.push(
      <TagFilterTag
        key={tag}
        tag={tag}
        name={name}
        disabledTagsSet={disabledTagsSet}
        getIndicator={getIndicator}
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
  name,
  disabledTagsSet,
  getIndicator,
  onChangeTags,
}: {
  tag: string
  name: string
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

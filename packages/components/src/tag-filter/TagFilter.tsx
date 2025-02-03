import { useProps } from "@mantine/core"
import clsx from "clsx"
import { PillBinProps, Pills } from "../pills/Pills.js"

export type TagFilterProps = {
  tags?: Iterable<string>
  disabledTags?: Iterable<string>
  onChangeTags?: (tags: Set<string>) => void
} & PillBinProps

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
      />
    )
  }

  return <Pills.Bin {...other}>{tagEls}</Pills.Bin>
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

  return (
    <Pills.Pill
      className={clsx(
        "TagFilter-tag",
        { "TagFilter-disabled": !enabled },
        textToClass("Pill-tag-", tag)
      )}
      button
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

const textToClass = (prefix: string, text: string): string => {
  const re = new RegExp("\\s+", "g")
  const suffix = text.trim().replaceAll(re, "-").toLowerCase()
  return `${prefix}${suffix}`
}

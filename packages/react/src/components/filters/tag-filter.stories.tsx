import type { Meta, StoryObj } from "@storybook/react-vite"
import { TagFilter, type TagFilterMode } from "./tag-filter.js"
import { useCallback, useState } from "react"
import { tagData } from "../../test-data-new.js"

const meta: Meta<typeof TagFilter> = {
  component: TagFilter,
  args: {
    label: "Filter Tags",
    tags: [...tagData, "Other"],
  },
}

export default meta

export const Default: StoryObj<typeof meta> = {
  render(args) {
    const [disabledTags, setDisabledTags] = useState<ReadonlySet<string>>(
      new Set(),
    )

    const [mode, setMode] = useState<TagFilterMode>("exclude")

    const onSetDisabled = useCallback(
      (tag: string, disabled: boolean) => {
        setDisabledTags((cur: ReadonlySet<string>) => {
          const newSet = new Set(cur)
          if (disabled) {
            newSet.add(tag)
          } else {
            newSet.delete(tag)
          }
          return newSet
        })
      },
      [setDisabledTags],
    )

    return (
      <TagFilter
        {...args}
        mode={mode}
        disabledTags={disabledTags}
        onSetDisabled={onSetDisabled}
        onSetMode={setMode}
      />
    )
  },
}

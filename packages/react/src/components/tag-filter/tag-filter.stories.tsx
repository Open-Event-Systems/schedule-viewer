import type { Meta, StoryObj } from "@storybook/react-vite"
import { TagFilter } from "./tag-filter.js"
import { useCallback, useState } from "react"

const meta: Meta<typeof TagFilter> = {
  component: TagFilter,
  args: {
    tags: [
      {
        tag: "art",
        title: "Art",
      },
      {
        tag: "photography",
        title: "Photography",
      },
      {
        tag: "mature",
        title: "Mature",
      },
    ],
    tagIndicators: [
      {
        tags: ["mature"],
        label: "18+",
      },
    ],
  },
}

export default meta

export const Default: StoryObj<typeof meta> = {
  render(args) {
    const [disabledTags, setDisabledTags] = useState<ReadonlySet<string>>(
      new Set(),
    )

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
        disabledTags={disabledTags}
        onSetDisabled={onSetDisabled}
      />
    )
  },
}

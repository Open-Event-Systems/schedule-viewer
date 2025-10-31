import type { Meta, StoryObj } from "@storybook/react-vite"
import { TagFilter } from "./tag-filter.js"
import { useState } from "react"

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

export const Default: StoryObj<typeof TagFilter> = {
  render(args) {
    const [disabledTags, setDisabledTags] = useState(() => new Set<string>())

    return (
      <TagFilter
        {...args}
        disabledTags={disabledTags}
        onChangeTags={setDisabledTags}
      />
    )
  },
}

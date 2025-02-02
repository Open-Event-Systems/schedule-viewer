import { Meta, StoryObj } from "@storybook/react"
import { TagFilter } from "./TagFilter.js"
import { useState } from "react"

import "../pills/Pills.scss"
import "./TagFilter.scss"

const meta: Meta<typeof TagFilter> = {
  component: TagFilter,
  args: {
    tags: ["main-event", "hobby", "music", "gaming"],
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

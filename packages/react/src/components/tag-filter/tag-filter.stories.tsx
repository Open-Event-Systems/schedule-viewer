import { Meta, StoryObj } from "@storybook/react-webpack5"
import { TagFilter } from "./tag-filter.js"
import { useState } from "react"

import "../pills/pills.scss"
import "./tag-filter.scss"

const meta: Meta<typeof TagFilter> = {
  component: TagFilter,
  args: {},
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

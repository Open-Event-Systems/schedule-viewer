import { Meta, StoryObj } from "@storybook/react"
import { Filter } from "./Filter.js"
import { useState } from "react"

import "../pills/Pills.scss"
import "../tag-filter/TagFilter.scss"

const meta: Meta<typeof Filter> = {
  component: Filter,
  args: {
    tags: ["Main Event", "Hobby", "Mature", "Gaming"],
  },
}

export default meta

export const Default: StoryObj<typeof Filter> = {
  render(args) {
    const [text, setText] = useState("")
    const [disabledTags, setDisabledTags] = useState<Set<string>>(new Set())
    const [showPast, setShowPast] = useState(false)

    return (
      <Filter
        {...args}
        text={text}
        disabledTags={disabledTags}
        showPastEvents={showPast}
        onChangeText={setText}
        onChangeTags={setDisabledTags}
        onChangeShowPastEvents={setShowPast}
      />
    )
  },
}

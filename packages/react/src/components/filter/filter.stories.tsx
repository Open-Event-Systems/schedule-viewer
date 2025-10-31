import type { Meta, StoryObj } from "@storybook/react-vite"
import { Filter } from "./filter.js"
import { useState } from "react"

const meta: Meta<typeof Filter> = {
  component: Filter,
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

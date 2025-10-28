import { Meta, StoryObj } from "@storybook/react-vite"
import { BookmarkFilter } from "./bookmark-filter.js"
import { useState } from "react"

const meta: Meta<typeof BookmarkFilter> = {
  component: BookmarkFilter,
}

export default meta

export const Default: StoryObj<typeof BookmarkFilter> = {
  render(args) {
    const [value, setValue] = useState(false)
    return <BookmarkFilter {...args} value={value} onChange={setValue} />
  },
}

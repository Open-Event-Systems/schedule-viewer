import type { Meta, StoryObj } from "@storybook/react-vite"
import { ItemDetails } from "./item-details.js"
import { events, tagEntries } from "../../test-data.js"
import { useState } from "react"

import "../icon-text/icon-text.scss"
import "./item-details.scss"

const meta: Meta<typeof ItemDetails> = {
  component: ItemDetails,
  args: {
    item: events[1],
    showShare: true,
  },
}

export default meta

export const Default: StoryObj<typeof ItemDetails> = {
  args: {
    h: 200,
    w: 400,
  },
  render(args) {
    const [bookmarked, setBookmarked] = useState(false)

    return (
      <ItemDetails
        {...args}
        tags={tagEntries}
        bookmarked={bookmarked}
        setBookmarked={setBookmarked}
        bookmarkCount={bookmarked ? 18 : 17}
      />
    )
  },
}

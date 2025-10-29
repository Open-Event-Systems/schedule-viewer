import type { Meta, StoryObj } from "@storybook/react-vite"
import { binItemsByTime, binItemsByTitle, ItemPills } from "./item-pills.js"
import { events, tagEntries } from "../../test-data.js"
import { type MouseEvent, useCallback } from "react"
import { ItemDetailsProvider, makeItemDetailsFunc } from "../details/context.js"

import "../details/item-details.scss"
import "../hovercard/item-hover-card.scss"
import "./pills.scss"

const meta: Meta<typeof ItemPills> = {
  component: ItemPills,
  args: {},
}

export default meta

export const Default: StoryObj<typeof ItemPills> = {
  render(args) {
    const onClick = useCallback((e: MouseEvent) => {
      e.preventDefault()
    }, [])
    const getHref = useCallback(() => "#", [])

    const bins = binItemsByTime(events, 30)

    return (
      <ItemDetailsProvider
        value={makeItemDetailsFunc({
          getHref,
          onClickItem: onClick,
          tags: tagEntries,
        })}
      >
        <ItemPills {...args} bins={bins} />
      </ItemDetailsProvider>
    )
  },
}

export const Alphabetical: StoryObj<typeof ItemPills> = {
  render(args) {
    const onClick = useCallback((e: MouseEvent) => {
      e.preventDefault()
    }, [])
    const getHref = useCallback(() => "#", [])

    const bins = binItemsByTitle([
      {
        id: "other1",
        type: "event",
        title: "!@#",
      },
      {
        id: "other2",
        type: "event",
        title: "4 Test",
      },
      {
        id: "other3",
        type: "event",
        title: "Other Event",
      },
      {
        id: "other4",
        type: "event",
      },
      ...events,
    ])

    return (
      <ItemDetailsProvider
        value={makeItemDetailsFunc({
          getHref,
          onClickItem: onClick,
          tags: tagEntries,
        })}
      >
        <ItemPills {...args} bins={bins} />
      </ItemDetailsProvider>
    )
  },
}

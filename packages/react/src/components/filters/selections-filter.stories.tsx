import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  SelectionsFilter,
  type SelectionsFilterOption,
} from "./selections-filter.js"
import { useState } from "react"

const meta: Meta<typeof SelectionsFilter> = {
  component: SelectionsFilter,
  args: {
    small: false,
  },
}

export default meta

export const Default: StoryObj<typeof SelectionsFilter> = {
  render(args) {
    const [value, setValue] = useState<ReadonlySet<SelectionsFilterOption>>(
      new Set(),
    )
    return <SelectionsFilter {...args} value={value} onChange={setValue} />
  },
}

export const AsAnchor: StoryObj<typeof SelectionsFilter> = {
  render(args) {
    const [value, setValue] = useState<ReadonlySet<SelectionsFilterOption>>(
      new Set(),
    )

    const getHref = (values: ReadonlySet<SelectionsFilterOption>) => {
      const newURL = new URL(window.location.href)
      const urlParams = new URLSearchParams(newURL.search)

      if (values.has("bookmarked")) {
        urlParams.set("bookmarked", "true")
      } else {
        urlParams.delete("bookmarked", "false")
      }

      if (values.has("unvisited")) {
        urlParams.set("unvisited", "true")
      } else {
        urlParams.delete("unvisited", "false")
      }

      newURL.search = String(urlParams)
      return String(newURL)
    }

    return (
      <SelectionsFilter
        {...args}
        value={value}
        getHref={getHref}
        onChange={setValue}
      />
    )
  },
}

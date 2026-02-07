import type { Meta, StoryObj } from "@storybook/react-vite"
import { Filter } from "./filter.js"
import { FilterContext, type FilterSettings } from "../../hooks/filter.js"
import { useReducer } from "react"

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
    const ctx = useReducer(
      (prevState: FilterSettings, action: FilterSettings) => {
        return {
          ...prevState,
          ...action,
        }
      },
      {
        disabledTags: new Set<string>(),
        onlyBookmarked: false,
        showPastEvents: false,
        text: "",
      },
    )

    return (
      <FilterContext value={ctx}>
        <Filter {...args} />
      </FilterContext>
    )
  },
}

import type { Meta, StoryObj } from "@storybook/react-vite"
import { Filter } from "./filter.js"
import { FilterContext, useNewFilterContext } from "../../hooks/filter.js"

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
    const ctx = useNewFilterContext()

    return (
      <FilterContext value={ctx}>
        <Filter {...args} />
      </FilterContext>
    )
  },
}

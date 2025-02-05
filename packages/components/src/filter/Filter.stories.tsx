import { Meta, StoryObj } from "@storybook/react"
import { Filter, FilterOptions } from "./Filter.js"
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
    const [options, setOptions] = useState<FilterOptions>({})

    return <Filter {...args} options={options} onChangeOptions={setOptions} />
  },
}

import type { Meta, StoryObj } from "@storybook/react-vite"
import { TextFilter } from "./text-filter.js"

const meta: Meta<typeof TextFilter> = {
  component: TextFilter,
}

export default meta

export const Default: StoryObj<typeof TextFilter> = {}

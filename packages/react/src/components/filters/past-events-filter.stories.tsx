import type { Meta, StoryObj } from "@storybook/react-vite"
import { PastEventsFilter } from "./past-events-filter.js"

const meta: Meta<typeof PastEventsFilter> = {
  component: PastEventsFilter,
}

export default meta

export const Default: StoryObj<typeof PastEventsFilter> = {}

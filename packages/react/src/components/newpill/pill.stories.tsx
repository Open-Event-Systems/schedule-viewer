import type { Meta, StoryObj } from "@storybook/react-vite"
import { Pill } from "./pill.js"
import { Flex } from "@mantine/core"

const meta: Meta<typeof Pill> = {
  component: Pill,
  decorators: [
    (Story) => (
      <Flex>
        <Story />
      </Flex>
    ),
  ],
}

export default meta

export const Default: StoryObj<typeof Pill> = {
  args: {
    children: "Example Event",
  },
}

export const WithIndicator: StoryObj<typeof Pill> = {
  args: {
    children: "With Indicator",
    indicator: "18+",
  },
}

export const WithBeforeAndAfter: StoryObj<typeof Pill> = {
  args: {
    children: "With Before/After",
    before: "⭐",
    after: "🎟️",
  },
}

export const AsLink: StoryObj<typeof Pill> = {
  args: {
    children: "As Link",
    indicator: "18+",
    renderRoot: (props) => (
      <a href="#" onClick={(e) => e.preventDefault()} {...props} />
    ),
  },
}

export const AsButton: StoryObj<typeof Pill> = {
  args: {
    children: "As Button",
    indicator: "18+",
    renderRoot: (props) => <button {...props} type="button" />,
  },
}

export const WithColor: StoryObj<typeof Pill> = {
  args: {
    children: "With Color",
    color: "#006c2e",
    textColor: "#ffffff",
  },
}

export const Disabled: StoryObj<typeof Pill> = {
  args: {
    children: "Disabled",
    color: "#006c2e",
    textColor: "#ffffff",
    disabled: true,
  },
}

export const WithMultiColors: StoryObj<typeof Pill> = {
  args: {
    children: "With Multi Colors",
    color: ["#006c2e", "#6c2900", "#1d006c"],
    textColor: "#ffffff",
  },
}

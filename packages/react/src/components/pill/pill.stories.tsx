import type { Meta, StoryObj } from "@storybook/react-vite"
import { Pills } from "./pills.js"
import { HoverCard } from "@mantine/core"

const meta: Meta<typeof Pills.Pill<"li">> = {
  component: Pills.Pill,
  decorators: [
    (Story) => (
      <Pills>
        <Story />
      </Pills>
    ),
  ],
}

export default meta

export const Button: StoryObj<typeof meta> = {
  args: {
    children: "Button Pill",
  },
}

export const Anchor: StoryObj<typeof meta> = {
  args: {
    children: "Anchor Pill",
    onClickBody: (e) => e.preventDefault(),
    renderBody: (props) => <a {...props} href="/" />,
  },
}

export const WithHoverCard: StoryObj<typeof meta> = {
  args: {
    children: "Pill With Hover Card",
    onClickBody: (e) => e.preventDefault(),
    renderHoverCard: ({ children }) => (
      <HoverCard>
        <HoverCard.Target>{children}</HoverCard.Target>
        <HoverCard.Dropdown>Dropdown content</HoverCard.Dropdown>
      </HoverCard>
    ),
    renderBody: (props) => <a {...props} href="/" />,
  },
}

export const WithIndicator: StoryObj<typeof meta> = {
  args: {
    children: "Pill With Indicator",
    onClickBody: (e) => e.preventDefault(),
    indicator: "18+",
    renderBody: (props) => <a {...props} href="/" />,
  },
}

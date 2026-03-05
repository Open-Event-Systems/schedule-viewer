import type { Meta, StoryObj } from "@storybook/react-vite"
import { Pills } from "./pills.js"
import { HoverCard } from "@mantine/core"

const meta: Meta<typeof Pills.Pill> = {
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

export const Anchor: StoryObj<typeof meta> = {
  args: {
    children: "Anchor Pill",
    href: "#",
    onClickBody: (e) => e.preventDefault(),
  },
}

export const Button: StoryObj<typeof meta> = {
  args: {
    children: "Button Pill",
    button: true,
  },
}

export const WithDropdown: StoryObj<typeof meta> = {
  args: {
    children: "Pill With Dropdown",
    href: "#",
    onClickBody: (e) => e.preventDefault(),
    renderHoverCard: ({ children }) => (
      <HoverCard>
        <HoverCard.Target>{children}</HoverCard.Target>
        <HoverCard.Dropdown>Dropdown content</HoverCard.Dropdown>
      </HoverCard>
    ),
  },
}

export const WithIndicator: StoryObj<typeof meta> = {
  args: {
    children: "Pill With Indicator",
    href: "#",
    onClickBody: (e) => e.preventDefault(),
    indicator: "18+",
  },
}

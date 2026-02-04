import type { Meta, StoryObj } from "@storybook/react-vite"
import { Pill } from "./pill.js"
import { HoverCard } from "@mantine/core"

const meta: Meta<typeof Pill> = {
  component: Pill,
}

export default meta

export const Default: StoryObj<typeof Pill> = {
  render() {
    return (
      <Pill.Bin title="Pill Bin">
        <Pill>Example Pill</Pill>
        <Pill button>Pill Button</Pill>
        <Pill indicator="M">Indicator</Pill>
        <Pill
          renderHoverCard={({ children }) => (
            <HoverCard>
              <HoverCard.Target>{children}</HoverCard.Target>
              <HoverCard.Dropdown>Example dropdown</HoverCard.Dropdown>
            </HoverCard>
          )}
        >
          Hover Card
        </Pill>
      </Pill.Bin>
    )
  },
}

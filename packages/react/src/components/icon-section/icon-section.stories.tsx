import type { Meta, StoryObj } from "@storybook/react-vite"
import { IconSection } from "./icon-section.js"
import { WarningCircleIcon } from "@phosphor-icons/react/dist/icons/WarningCircle"

const meta: Meta<typeof IconSection> = {
  component: IconSection,
  argTypes: {
    size: {
      options: ["xs", "sm", "md", "lg", "xl"],
      control: "radio",
    },
  },
}

export default meta

export const Default: StoryObj<typeof IconSection> = {
  args: {
    icon: <WarningCircleIcon />,
    children: "Example content",
  },
}

export const Color: StoryObj<typeof IconSection> = {
  args: {
    color: "gray.7",
    icon: <WarningCircleIcon />,
    children: "Example content",
  },
}

export const MultiLine: StoryObj<typeof IconSection> = {
  args: {
    icon: <WarningCircleIcon />,
    children: (
      <>
        Example content
        <br />
        With multiple lines
        <br />
        of content
      </>
    ),
  },
}

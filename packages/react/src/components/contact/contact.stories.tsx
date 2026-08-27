import type { Meta, StoryObj } from "@storybook/react-vite"
import { Contact } from "./contact.js"
import { Flex } from "@mantine/core"

const meta: Meta<typeof Contact> = {
  component: Contact,
  argTypes: {
    size: {
      options: ["xs", "sm", "md", "lg", "xl"],
      control: "radio",
    },
  },
  decorators: [
    (Story) => (
      <Flex>
        <Story />
      </Flex>
    ),
  ],
  args: {
    color: "gray.7",
  },
}

export default meta

export const Default: StoryObj<typeof Contact> = {
  args: {
    name: "Example Person",
  },
}

export const WithIcon: StoryObj<typeof Contact> = {
  args: {
    name: "Example Person",
    iconURL:
      "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png",
  },
}

export const AsLink: StoryObj<typeof Contact> = {
  args: {
    name: "Example Person",
    iconURL:
      "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png",
    href: "#",
    onClickLink: (e) => e.preventDefault(),
  },
}

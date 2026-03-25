import type { Meta, StoryObj } from "@storybook/react-vite"
import { MainLayout } from "./main-layout.js"
import { useState } from "react"
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { ActionIcon, Stack } from "@mantine/core"
import { IconDownload } from "@tabler/icons-react"

const meta: Meta<typeof MainLayout> = {
  component: MainLayout,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    title: "Page Title",
    homeURL: "#",
  },
  decorators: [
    (Story) => {
      const [{ router }] = useState(() => ({
        router: createRouter({
          routeTree: createRootRoute({
            component: Story,
          }),
          history: createMemoryHistory(),
          context: {
            pageTitle: "Test",
          },
        }),
      }))

      return <RouterProvider router={router} />
    },
  ],
}

export default meta

export const Default: StoryObj<typeof MainLayout> = {
  render(args) {
    return (
      <MainLayout
        {...args}
        w="100dvw"
        h="100dvh"
        style={{ "--max-page-width": "75rem" }}
        menu={
          <Stack p="xs">
            <ActionIcon variant="outline">
              <IconDownload />
            </ActionIcon>
          </Stack>
        }
      >
        Main Layout Content
      </MainLayout>
    )
  },
}

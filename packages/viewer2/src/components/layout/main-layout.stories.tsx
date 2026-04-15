import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { MainLayout } from "./main-layout.js"
import { ActionIcon } from "@mantine/core"
import { IconInfoCircle } from "@tabler/icons-react"

const meta: Meta<typeof MainLayout> = {
  component: MainLayout,
  parameters: {
    layout: "fullscreen",
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
      <MainLayout {...args} w="100dvw" h="100dvh">
        <MainLayout.Header
          icons={
            <>
              <ActionIcon variant="subtle" size="md" radius="xl">
                <IconInfoCircle />
              </ActionIcon>
              <ActionIcon variant="subtle" size="md" radius="xl">
                <IconInfoCircle />
              </ActionIcon>
              <ActionIcon variant="subtle" size="md" radius="xl">
                <IconInfoCircle />
              </ActionIcon>
            </>
          }
        >
          <MainLayout.Title>Page Title</MainLayout.Title>
        </MainLayout.Header>
        <MainLayout.Content>Children</MainLayout.Content>
        <MainLayout.Footer rightSection="Right">
          Footer Content
        </MainLayout.Footer>
      </MainLayout>
    )
  },
}

export const WithAnchor: StoryObj<typeof MainLayout> = {
  render(args) {
    return (
      <MainLayout {...args} w="100dvw" h="100dvh">
        <MainLayout.Header
          icons={
            <>
              <ActionIcon variant="subtle" size="md" radius="xl">
                <IconInfoCircle />
              </ActionIcon>
              <ActionIcon variant="subtle" size="md" radius="xl">
                <IconInfoCircle />
              </ActionIcon>
              <ActionIcon variant="subtle" size="md" radius="xl">
                <IconInfoCircle />
              </ActionIcon>
            </>
          }
        >
          <MainLayout.Title homeURL="#">Page Title</MainLayout.Title>
        </MainLayout.Header>
        <MainLayout.Content>Children</MainLayout.Content>
        <MainLayout.Footer rightSection="Right">
          Footer Content
        </MainLayout.Footer>
      </MainLayout>
    )
  },
}

export const WithIcon: StoryObj<typeof MainLayout> = {
  render(args) {
    return (
      <MainLayout {...args} w="100dvw" h="100dvh">
        <MainLayout.Header
          icons={
            <>
              <ActionIcon variant="subtle" size="md" radius="xl">
                <IconInfoCircle />
              </ActionIcon>
              <ActionIcon variant="subtle" size="md" radius="xl">
                <IconInfoCircle />
              </ActionIcon>
              <ActionIcon variant="subtle" size="md" radius="xl">
                <IconInfoCircle />
              </ActionIcon>
            </>
          }
        >
          <MainLayout.Title logoURL="/example-icon-192.png">
            Page Title
          </MainLayout.Title>
        </MainLayout.Header>
        <MainLayout.Content>Children</MainLayout.Content>
        <MainLayout.Footer rightSection="Right">
          Footer Content
        </MainLayout.Footer>
      </MainLayout>
    )
  },
}

export const WithIconAndAnchor: StoryObj<typeof MainLayout> = {
  render(args) {
    return (
      <MainLayout {...args} w="100dvw" h="100dvh">
        <MainLayout.Header
          icons={
            <>
              <ActionIcon variant="subtle" size="md" radius="xl">
                <IconInfoCircle />
              </ActionIcon>
              <ActionIcon variant="subtle" size="md" radius="xl">
                <IconInfoCircle />
              </ActionIcon>
              <ActionIcon variant="subtle" size="md" radius="xl">
                <IconInfoCircle />
              </ActionIcon>
            </>
          }
        >
          <MainLayout.Title homeURL="#" logoURL="/example-icon-192.png">
            Page Title
          </MainLayout.Title>
        </MainLayout.Header>
        <MainLayout.Content>Children</MainLayout.Content>
        <MainLayout.Footer rightSection="Right">
          Footer Content
        </MainLayout.Footer>
      </MainLayout>
    )
  },
}

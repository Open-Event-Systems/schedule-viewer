import type { Meta, StoryObj } from "@storybook/react-vite"
import { ConfirmSyncPage } from "./confirm-sync.js"
import { MainLayout } from "../layout/main-layout.js"

const meta: Meta<typeof ConfirmSyncPage> = {
  component: ConfirmSyncPage,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <MainLayout h="100dvh" w="100dvw">
        <MainLayout.Header />
        <MainLayout.Content>
          <Story />
        </MainLayout.Content>
        <MainLayout.Footer />
      </MainLayout>
    ),
  ],
}

export default meta

export const Default: StoryObj<typeof ConfirmSyncPage> = {}

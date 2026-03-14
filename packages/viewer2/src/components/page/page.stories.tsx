import type { Meta, StoryObj } from "@storybook/react-vite"
import { Page } from "./page.js"
import { useState } from "react"
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { ViewerConfigContext } from "../../config.js"
import { DEFAULT_SCHEDULE_CONFIG } from "@open-event-systems/schedule-react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { makeScheduleItemCollection } from "@open-event-systems/schedule-lib"

const meta: Meta<typeof Page> = {
  component: Page,
  decorators: [
    (Story) => {
      const [{ router, queryClient }] = useState(() => {
        const router = createRouter({
          history: createMemoryHistory(),
          routeTree: createRootRoute({
            component: Story,
          }),
        })

        const queryClient = new QueryClient()

        return { router, queryClient }
      })

      return (
        <ViewerConfigContext
          value={{
            ...DEFAULT_SCHEDULE_CONFIG,
            id: "example",
            pages: [
              {
                id: "page1",
                title: "Page 1",
              },
            ],
          }}
        >
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </ViewerConfigContext>
      )
    },
  ],
}

export default meta

export const Default: StoryObj<typeof Page> = {
  args: {
    items: makeScheduleItemCollection([
      {
        id: "event1",
        type: "event",
      },
    ]),
    pageConfig: {
      id: "page1",
      title: "Page 1",
      description: "Page description **with Markdown**.",
    },
  },
}

import type { Meta, StoryObj } from "@storybook/react-vite"
import { Page } from "./page.js"
import { useState } from "react"
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { DEFAULT_VIEWER_CONFIG, ViewerConfigContext } from "../../config.js"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { makeScheduleItemCollection } from "@open-event-systems/schedule-lib"
import { FilterStateStoreContext, makeFilterStateStore } from "../../filter.js"

const meta: Meta<typeof Page> = {
  component: Page,
  decorators: [
    (Story) => {
      const [{ router, queryClient, filterStateStore }] = useState(() => {
        return {
          router: createRouter({
            history: createMemoryHistory(),
            routeTree: createRootRoute({
              component: Story,
            }),
          }),
          queryClient: new QueryClient(),
          filterStateStore: makeFilterStateStore(),
        }
      })

      return (
        <ViewerConfigContext
          value={{
            ...DEFAULT_VIEWER_CONFIG,
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
            <FilterStateStoreContext value={filterStateStore}>
              <RouterProvider router={router} />
            </FilterStateStoreContext>
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

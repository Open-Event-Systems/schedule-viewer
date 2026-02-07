import type { Meta, StoryObj } from "@storybook/react-vite"
import { Page } from "./page.js"
import { useReducer, useState } from "react"
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { ViewerConfigContext } from "../../config.js"
import {
  DEFAULT_SCHEDULE_CONFIG,
  type ScheduleType,
  type FilterSettings,
  FilterContext,
} from "@open-event-systems/schedule-react"
import { ScheduleItemStore } from "@open-event-systems/schedule-lib"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ViewTypeContext } from "../../routes/filter-state.js"

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

      const filterCtx = useReducer(
        (prev: FilterSettings, update: FilterSettings) => ({
          ...prev,
          ...update,
        }),
        {},
      )
      const typeCtx = useState<ScheduleType | undefined>()

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
            <FilterContext value={filterCtx}>
              <ViewTypeContext value={typeCtx}>
                <RouterProvider router={router} />
              </ViewTypeContext>
            </FilterContext>
          </QueryClientProvider>
        </ViewerConfigContext>
      )
    },
  ],
}

export default meta

export const Default: StoryObj<typeof Page> = {
  args: {
    items: new ScheduleItemStore([
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

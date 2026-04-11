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
import { FilterStateStoreContext, makeFilterStateStore } from "../../filter.js"
import {
  makeMemoryLocalSelectionsStore,
  makeSyncedSelectionsAPI,
} from "@open-event-systems/schedule-lib"
import { SessionSelectionsAPIContext } from "@open-event-systems/schedule-react"

const meta: Meta<typeof Page> = {
  component: Page,
  decorators: [
    (Story) => {
      const [{ router, queryClient, filterStateStore, sessionSelectionsAPI }] =
        useState(() => {
          return {
            router: createRouter({
              history: createMemoryHistory(),
              routeTree: createRootRoute({
                component: Story,
              }),
            }),
            queryClient: new QueryClient(),
            filterStateStore: makeFilterStateStore(),
            sessionSelectionsAPI: makeSyncedSelectionsAPI(
              "bookmarks",
              makeMemoryLocalSelectionsStore(),
            ),
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
                views: [
                  {
                    id: "default",
                    title: "Default",
                    type: "daily-agenda",
                  },
                ],
              },
            ],
          }}
        >
          <QueryClientProvider client={queryClient}>
            <FilterStateStoreContext value={filterStateStore}>
              <SessionSelectionsAPIContext
                value={{ bookmarks: sessionSelectionsAPI }}
              >
                <RouterProvider router={router} />
              </SessionSelectionsAPIContext>
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
    items: [
      {
        id: "event1",
        type: "event",
      },
    ],
    pageConfig: {
      id: "page1",
      title: "Page 1",
      description: "Page description **with Markdown**.",
      views: [
        {
          id: "default",
          title: "Default",
          type: "daily-agenda",
        },
      ],
    },
  },
}

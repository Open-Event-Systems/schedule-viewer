import {
  BookmarkAPI,
  makeBookmarkAPI,
  ScheduleConfig,
} from "@open-event-systems/schedule-lib"
import { QueryClient, UseSuspenseQueryOptions } from "@tanstack/react-query"
import wretch from "wretch"

export type AppConfig = Readonly<{
  config: ScheduleConfig
  bookmarkAPI?: BookmarkAPI
  sessionId?: string
}>

export const getConfigQueryOptions = (
  configURL: string,
): UseSuspenseQueryOptions<ScheduleConfig> => {
  return {
    queryKey: ["schedule-config"],
    async queryFn() {
      const res = await wretch(configURL).get().json<ScheduleConfig>()
      return res
    },
    staleTime: Infinity,
  }
}

export const makeAppConfig = async (
  queryClient: QueryClient,
  configURL: string,
): Promise<AppConfig> => {
  const config = await queryClient.fetchQuery(getConfigQueryOptions(configURL))
  let bookmarkAPI = config.bookmarks
    ? makeBookmarkAPI(config.bookmarks)
    : undefined

  let sessionId: string | undefined

  if (bookmarkAPI) {
  }

  if (bookmarkAPI) {
    try {
      const res = await bookmarkAPI.setup()
      sessionId = res.sessionId
    } catch (_e) {
      bookmarkAPI = undefined
    }
  }

  return { config, bookmarkAPI, sessionId }
}

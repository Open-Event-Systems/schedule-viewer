import {
  BookmarkAPI,
  makeBookmarkAPI,
  RequiredScheduleConfig,
} from "@open-event-systems/schedule-lib"
import { QueryClient, UseSuspenseQueryOptions } from "@tanstack/react-query"
import wretch from "wretch"

export type AppConfig = Readonly<{
  config: RequiredScheduleConfig
  bookmarkAPI?: BookmarkAPI
  sessionId?: string
}>

export const getConfigQueryOptions = (
  configURL: string,
): UseSuspenseQueryOptions<RequiredScheduleConfig> => {
  return {
    queryKey: ["schedule-config"],
    async queryFn() {
      const res = await wretch(configURL).get().json<RequiredScheduleConfig>()
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
  const bookmarkAPI = config.bookmarks
    ? makeBookmarkAPI(config.bookmarks)
    : undefined

  let sessionId: string | undefined

  if (bookmarkAPI) {
    const res = await bookmarkAPI.setup()
    sessionId = res.sessionId
  }

  return { config, bookmarkAPI, sessionId }
}

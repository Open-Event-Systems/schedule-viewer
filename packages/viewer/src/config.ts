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

  return { config, bookmarkAPI }
}

import {
  QueryClient,
  queryOptions,
  useSuspenseQuery,
} from "@tanstack/react-query"
import type { Dayjs } from "dayjs"
import dayjs from "dayjs"

const nowQueryOptions = queryOptions({
  queryKey: ["now"],
  queryFn: () => dayjs(),
  staleTime: 60000,
})

/**
 * Get the current time.
 */
export const getNow = async (queryClient: QueryClient): Promise<Dayjs> => {
  return await queryClient.query(nowQueryOptions)
}

/**
 * Hook to get the current time.
 */
export const useNow = (): Dayjs => {
  const query = useSuspenseQuery(nowQueryOptions)
  return query.data
}

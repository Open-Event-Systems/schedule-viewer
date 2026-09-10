import { queryOptions } from "@tanstack/react-query"
import { parseConfig } from "../config/schema.js"

export const ConfigQueryKey = {
  config: (url: string) => ["config", url]
} as const

export const ConfigQueryOptions = {
  config: (url: string) => queryOptions({
    queryKey: ConfigQueryKey.config(url),
    queryFn: async () => {
      return await fetch(url).then((res) => res.json()).then((data) => parseConfig(data))
    },
    staleTime: Infinity
  })
}
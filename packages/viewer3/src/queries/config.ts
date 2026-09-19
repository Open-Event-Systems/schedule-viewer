import { queryOptions } from "@tanstack/react-query"

export const ConfigQueryKey = {
  config: (url: string) => ["config", url],
} as const

export const ConfigQueryOptions = {
  config: (url: string) =>
    queryOptions({
      queryKey: ConfigQueryKey.config(url),
      queryFn: async () => {
        const { parseConfig } = await import("#src/config/schema.js")
        const data = await fetch(url).then((res) => res.json())
        return parseConfig(data)
      },
      structuralSharing: false,
      staleTime: Infinity,
    }),
}

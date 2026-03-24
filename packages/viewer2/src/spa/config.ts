/**
 * SPA specific configuration.
 */
import type { MantineThemeOverride } from "@mantine/core"

export type SPAConfig = Readonly<{
  [key: string]: unknown
  theme?: MantineThemeOverride
  colorScheme: "light" | "dark"
  basePath: string
  serviceWorker: boolean
  cacheURLs: readonly string[]
  router: "hash" | "browser"
}>

export const DEFAULT_SPA_CONFIG = {
  colorScheme: "light",
  basePath: "",
  serviceWorker: false,
  cacheURLs: [],
  router: "hash",
} as const satisfies SPAConfig

export const getSPAConfig = (): SPAConfig => {
  const input = typeof scheduleConfig == "object" ? scheduleConfig : {}
  return {
    ...DEFAULT_SPA_CONFIG,
    ...input,
  }
}

declare global {
  var scheduleConfig: Partial<SPAConfig> | undefined
}

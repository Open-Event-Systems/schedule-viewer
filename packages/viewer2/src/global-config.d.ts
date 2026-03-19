import type { MantineThemeOverride } from "@mantine/core"

export type ScheduleJSConfig =
  | Readonly<{
      [key: string]: unknown
      theme?: MantineThemeOverride
      colorScheme?: "light" | "dark"
      basePath?: string
      serviceWorker?: boolean
      cacheURLs?: readonly string[]
      router?: "hash" | "browser"
    }>
  | undefined

declare global {
  var scheduleConfig: ScheduleJSConfig
  var __VIEWER_VERSION__: string
}

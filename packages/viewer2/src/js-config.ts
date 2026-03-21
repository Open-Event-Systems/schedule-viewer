import type { ScheduleJSConfig } from "./types.js"

const DEFAULT_JS_CONFIG = {
  colorScheme: "light",
  basePath: "",
  serviceWorker: false,
  cacheURLs: [],
  router: "hash",
} as const satisfies ScheduleJSConfig

export const getJSConfig = (): ScheduleJSConfig => {
  const input = typeof scheduleConfig == "object" ? scheduleConfig : {}
  return {
    ...DEFAULT_JS_CONFIG,
    ...input,
  }
}

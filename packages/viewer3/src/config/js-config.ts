/**
 * JS configuration settings.
 * @module
 */

import type { MantineThemeOverride } from "@mantine/core"
import { makeLocalStorageSessionSelectionsStore, makeMemoryLocalSelectionsStore, omitUndef } from "@open-event-systems/schedule-lib"
import type { AppContextValue } from "../hooks/app.js"
import { makeScheduleAPIFromConfig } from "./config.js"
import type { QueryClient } from "@tanstack/react-query"
import { ConfigQueryOptions } from "../queries/config.js"

export type JSConfig = Readonly<{
  basePath: string
  origin: string
  configURL: string
  theme?: MantineThemeOverride
}>

declare global {
  var ULE_CONFIG: Partial<JSConfig> | undefined

  interface ImportMetaEnv {
    VITE_SSR_CLIENT?: string
  }
}

const getDefaultOrigin = (): string => {
  if (typeof window != "undefined") {
    return window.origin
  } else {
    return ""
  }
}

export const DEFAULT_JS_CONFIG = {
  origin: getDefaultOrigin(),
  basePath: "/",
  configURL: "/config.json",
} as const satisfies JSConfig

/**
 * Get the JS config.
 */
export const getJSConfig = (jsConfig?: Partial<JSConfig>): JSConfig => {
  return {
    ...DEFAULT_JS_CONFIG,
    ...omitUndef(jsConfig || self.ULE_CONFIG || {}),
  }
}

/**
 * Get an {@link AppContextValue} from the JS config.
 */
export const makeAppContext = (
  jsConfig: JSConfig,
  queryClient: QueryClient,
  appType: "spa"|"ssr"
): AppContextValue => {
  const fullConfigURL = new URL(jsConfig.configURL, jsConfig.origin).href

  const configPromise = queryClient.query(ConfigQueryOptions.config(fullConfigURL))

  return {
    appType,
    origin: jsConfig.origin,
    basePath: jsConfig.basePath,
    queryClient,
    config: configPromise,
    theme: jsConfig.theme,
    scheduleAPI: configPromise.then((config) => makeScheduleAPIFromConfig(config)),
    selectionsStore: configPromise.then((config) => {
      // TODO: create based on config
      if (import.meta.env.SSR) {
        return makeMemoryLocalSelectionsStore()
      } else {
        return makeLocalStorageSessionSelectionsStore(config.id)
      }
    }),
  }
}

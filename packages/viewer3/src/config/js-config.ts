/**
 * JS configuration settings.
 * @module
 */

import type { AppContext } from "#src/app.js"
import type { MantineThemeOverride } from "@mantine/core"
import {
  makeLocalStorageSessionSelectionsStore,
  makeMemoryLocalSelectionsStore,
  omitUndef,
} from "@open-event-systems/schedule-lib"
import {
  makeAppContext as makeBaseAppContext,
  type AppType,
  type BasePathString,
  type OriginString,
} from "@open-event-systems/schedule-react"
import type { QueryClient } from "@tanstack/react-query"
import { ConfigQueryOptions } from "../queries/config.js"
import { makeScheduleAPIFromConfig } from "./config.js"

export type JSConfig = Readonly<{
  basePath: BasePathString
  origin: OriginString
  configURL: string
  theme?: MantineThemeOverride
}>

declare global {
  var ULE_CONFIG: Partial<JSConfig> | undefined
}

const getDefaultOrigin = (): OriginString | undefined => {
  if (typeof window != "undefined") {
    return window.origin as OriginString
  }
}

export const DEFAULT_JS_CONFIG = {
  origin: getDefaultOrigin() ?? "http://localhost:5173",
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
  appType: AppType,
): AppContext => {
  const fullConfigURL = new URL(jsConfig.configURL, jsConfig.origin).href

  const configPromise = queryClient.query(
    ConfigQueryOptions.config(fullConfigURL),
  )

  return makeBaseAppContext({
    appType,
    config: configPromise,
    queryClient,
    scheduleAPI: configPromise.then((config) =>
      makeScheduleAPIFromConfig(config),
    ),
    selectionsStore: configPromise.then((config) => {
      // TODO: create based on config
      if (import.meta.env.SSR) {
        return makeMemoryLocalSelectionsStore()
      } else {
        return makeLocalStorageSessionSelectionsStore(config.id)
      }
    }),
    basePath: jsConfig.basePath,
    origin: jsConfig.origin,
  })
}

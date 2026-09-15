/**
 * SSR serialization utilities.
 * @module
 */
import { DATA_KEY } from "#src/serialization/deserialization.js"
import {
  dayjsSerovalPlugin,
  durationSerovalPlugin,
  REHYDRATORS_KEY,
  selectionsSerovalPlugin,
} from "@open-event-systems/schedule-lib/serialization"
import { useMemo } from "react"
import {
  createPlugin,
  serialize as serovalSerialize,
  type Plugin,
  type PluginInfo,
} from "seroval"

export const defaultPlugins = [
  createPlugin(dayjsSerovalPlugin),
  createPlugin(durationSerovalPlugin),
  createPlugin(selectionsSerovalPlugin),
]

/**
 * Serialize data to a string representing a JS function.
 */
export const serialize = (
  data: unknown,
  plugins?: Iterable<Plugin<unknown, PluginInfo>>,
): string => {
  const outStr = serovalSerialize(data, {
    plugins: plugins ? [...plugins] : defaultPlugins,
  })
  return `(${REHYDRATORS_KEY}=>${outStr})`
}

/**
 * Renders a <script> tag containing dehydrated data for the client.
 */
export const DehydratedData = ({
  data,
  plugins,
  dataKey,
}: {
  data?: unknown
  plugins?: Iterable<Plugin<unknown, PluginInfo>>
  dataKey?: string
}) => {
  dataKey = dataKey || DATA_KEY
  const jsStr = useMemo(() => {
    const funcStr = serialize(data, plugins)
    return `self["${DATA_KEY}"]=${funcStr};document.currentScript.remove()`
  }, [data, plugins, dataKey])

  return <script suppressHydrationWarning>{jsStr}</script>
}

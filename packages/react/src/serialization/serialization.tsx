/**
 * SSR serialization utilities.
 * @module
 */
import { type Hydrator } from "#src/serialization/deserialization.js"
import { isTagsConfig, type TagConfig } from "#src/tags.js"
import {
  dayjsSerovalPlugin,
  durationSerovalPlugin,
  HYDRATORS_KEY,
  makeSerovalPlugin,
  scheduleDataSerovalPlugin,
  selectionsSerovalPlugin,
} from "@open-event-systems/schedule-lib/serialization"
import type { ReactNode } from "react"
import {
  serialize as serovalSerialize,
  type Plugin,
  type PluginInfo,
} from "seroval"

export type Dehydrators<M> = Readonly<{
  [K in keyof M]: Plugin<M[K], PluginInfo> & { tag: K }
}>

export type Dehydrator<D> = {
  (data: D): string
} & Readonly<{
  DehydratedData: (props: { data: D }) => ReactNode
}>

export const makeDehydrator = <M, D extends Record<string, unknown>, K>(
  hydrator: Hydrator<M, D, K>,
  dehydrators: NoInfer<Dehydrators<M>>,
): Dehydrator<D> => {
  const plugins: (typeof dehydrators)[keyof typeof dehydrators][] = []
  for (const value of Object.values(dehydrators)) {
    plugins.push(value as (typeof dehydrators)[keyof typeof dehydrators])
  }

  const dehydrate = (data: D): string => {
    const asStr = serovalSerialize(data, { plugins })
    return `self["${hydrator.key}"]=(${HYDRATORS_KEY}=>${asStr});document.currentScript.remove()`
  }

  const DehydratedData = ({ data }: { data: D }) => {
    return <script suppressHydrationWarning>{dehydrate(data)}</script>
  }

  dehydrate.DehydratedData = DehydratedData

  return dehydrate
}

export const defaultDehydrators = {
  dayjs: dayjsSerovalPlugin,
  duration: durationSerovalPlugin,
  selections: selectionsSerovalPlugin,
  scheduleData: scheduleDataSerovalPlugin,
  tagsConfig: makeSerovalPlugin(
    "tagsConfig",
    (value) => isTagsConfig(value),
    (value) => {
      const records: Record<string, Partial<TagConfig>> = {}

      for (const { value: tagVal, ...other } of value) {
        records[tagVal] = other
      }

      return records
    },
  ),
} as const

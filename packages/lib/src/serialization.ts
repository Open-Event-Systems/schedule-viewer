/**
 * Data serialization utilities.
 * @module
 */

import { indexScheduleData, isScheduleData } from "#src/data.js"
import {
  formatDuration,
  formatISO,
  parseDuration,
  parseISO,
} from "#src/date.js"
import {
  isSelections,
  parseSelections,
  unparseSelections,
} from "#src/selections.js"
import type { ScheduleItemSeries } from "#src/types.js"
import dayjs from "dayjs"

type Node<N> = {
  d: N
}

type SyncSerovalParseContext<N> = Readonly<{
  parse: <T>(value: T) => N
}>

type AsyncSerovalParseContext<N> = Readonly<{
  parse: <T>(value: T) => Promise<N>
}>

type SerovalSerializeContext<N> = Readonly<{
  serialize: (value: N) => string
}>

type SerovalPlugin<T, K extends string = string> = Readonly<{
  tag: K
  test: (value: unknown) => boolean
  parse: {
    sync: <N>(value: T, ctx: SyncSerovalParseContext<N>) => Node<N>
    async: <N>(value: T, ctx: AsyncSerovalParseContext<N>) => Promise<Node<N>>
    stream: <N>(value: T, ctx: SyncSerovalParseContext<N>) => Node<N>
  }
  serialize: <N>(node: Node<N>, ctx: SerovalSerializeContext<N>) => string
  deserialize: () => T
}>

export const HYDRATORS_KEY = "f"

export const makeSerovalPlugin = <T, K extends string>(
  key: K,
  test: (value: unknown) => value is T,
  unstructure: (value: T) => unknown,
): SerovalPlugin<T, K> => {
  return {
    tag: key,
    test,
    parse: {
      sync: <N>(value: T, ctx: SyncSerovalParseContext<N>): Node<N> => {
        const strVal = ctx.parse(unstructure(value))
        return { d: strVal }
      },
      async: async <N>(
        value: T,
        ctx: AsyncSerovalParseContext<N>,
      ): Promise<Node<N>> => {
        const strVal = await ctx.parse(unstructure(value))
        return { d: strVal }
      },
      stream: <N>(value: T, ctx: SyncSerovalParseContext<N>): Node<N> => {
        const strVal = ctx.parse(unstructure(value))
        return { d: strVal }
      },
    },
    serialize: <N>(node: Node<N>, ctx: SerovalSerializeContext<N>): string => {
      const strVal = ctx.serialize(node.d)
      return `${HYDRATORS_KEY}.${key}(${strVal})`
    },
    deserialize: () => {
      throw new Error("Deserialization not implemented")
    },
  }
}

export const dayjsSerovalPlugin = makeSerovalPlugin(
  "dayjs",
  (value) => dayjs.isDayjs(value),
  (value) => formatISO(value),
)

export const durationSerovalPlugin = makeSerovalPlugin(
  "duration",
  (value) => dayjs.isDuration(value),
  (value) => formatDuration(value),
)

export const selectionsSerovalPlugin = makeSerovalPlugin(
  "selections",
  (value) => isSelections(value),
  (value) => unparseSelections(value),
)

export const scheduleDataSerovalPlugin = makeSerovalPlugin(
  "scheduleData",
  (value) => isScheduleData(value),
  (value) => [...value],
)

export const defaultHydrators = {
  dayjs: (v: unknown) => parseISO(v as string),
  duration: (v: unknown) => parseDuration(v as string),
  selections: (v: unknown) => {
    const res = parseSelections(v)
    if (res.success) {
      return res.data
    } else {
      throw res.error
    }
  },
  scheduleData: (v: unknown) =>
    indexScheduleData(v as Iterable<ScheduleItemSeries> | null),
} as const

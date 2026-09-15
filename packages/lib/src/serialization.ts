/**
 * Data serialization utilities.
 * @module
 */

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
import type { Selections } from "#src/types.js"
import dayjs, { type Dayjs } from "dayjs"
import type durationPlugin from "dayjs/plugin/duration.js"

import type { Plugin, SerovalNode } from "seroval"

export const REHYDRATORS_KEY = "f"

type DayjsNode = {
  s: SerovalNode
}

export const dayjsSerovalPlugin = {
  tag: "dayjs",
  test: (value) => typeof value == "object" && dayjs.isDayjs(value),
  parse: {
    sync: (value, ctx) => {
      return {
        s: ctx.parse(formatISO(value)),
      }
    },
    async: async (value, ctx) => {
      return {
        s: await ctx.parse(formatISO(value)),
      }
    },
    stream: (value, ctx) => {
      return {
        s: ctx.parse(formatISO(value)),
      }
    },
  },
  serialize: (node, ctx) => {
    const strVal = ctx.serialize(node.s)
    return `${REHYDRATORS_KEY}.dayjs(${strVal})`
  },
  deserialize: (node, ctx) => {
    return parseISO(ctx.deserialize(node.s))
  },
} as const satisfies Plugin<Dayjs, DayjsNode>

export const durationSerovalPlugin = {
  tag: "duration",
  test: (value) => typeof value == "object" && dayjs.isDuration(value),
  parse: {
    sync: (value, ctx) => {
      return {
        s: ctx.parse(formatDuration(value)),
      }
    },
    async: async (value, ctx) => {
      return {
        s: await ctx.parse(formatDuration(value)),
      }
    },
    stream: (value, ctx) => {
      return {
        s: ctx.parse(formatDuration(value)),
      }
    },
  },
  serialize: (node, ctx) => {
    const strVal = ctx.serialize(node.s)
    return `${REHYDRATORS_KEY}.duration(${strVal})`
  },
  deserialize: (node, ctx) => {
    return parseDuration(ctx.deserialize(node.s))
  },
} as const satisfies Plugin<durationPlugin.Duration, DayjsNode>

type SelectionsNode = {
  s: SerovalNode
}

export const selectionsSerovalPlugin = {
  tag: "selections",
  test: (value) => typeof value == "object" && isSelections(value),
  parse: {
    sync: (value, ctx) => {
      return {
        s: ctx.parse(unparseSelections(value)),
      }
    },
    async: async (value, ctx) => {
      return {
        s: await ctx.parse(unparseSelections(value)),
      }
    },
    stream: (value, ctx) => {
      return {
        s: ctx.parse(unparseSelections(value)),
      }
    },
  },
  serialize: (node, ctx) => {
    const val = ctx.serialize(node.s)
    return `${REHYDRATORS_KEY}.selections(${val})`
  },
  deserialize: (node, cxt) => {
    const res = parseSelections(cxt.deserialize(node.s))
    if (res.success) {
      return res.data
    } else {
      throw res.error
    }
  },
} as const satisfies Plugin<Selections, SelectionsNode>

export const defaultRehydrators = {
  dayjs: (v: unknown) => parseISO(v as string),
  duration: (v: unknown) => parseDuration(v as string),
  selections: (v: unknown) => parseSelections(v),
}

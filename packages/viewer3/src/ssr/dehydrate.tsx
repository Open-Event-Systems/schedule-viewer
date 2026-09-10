import {
  formatISO,
  isSelections,
  parseISO,
  parseSelections,
  unparseSelections,
  type Selections,
} from "@open-event-systems/schedule-lib"
import { dehydrate, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import dayjs from "dayjs"
import { createPlugin, serialize, type SerovalNode } from "seroval"
import type { DehydratedData } from "./hydrate.js"

type DayjsNode = {
  s: SerovalNode
}

const dayjsPlugin = createPlugin<dayjs.Dayjs, DayjsNode>({
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
    const val = ctx.serialize(node.s)
    return `f.dayjs(${val})`
  },
  deserialize: (node, ctx) => {
    return parseISO(ctx.deserialize(node.s))
  },
})

type SelectionsNode = {
  d: SerovalNode
}

const selectionsPlugin = createPlugin<Selections, SelectionsNode>({
  tag: "selections",
  test: (value) => {
    const res = typeof value == "object" && isSelections(value)
    return res
  },
  parse: {
    sync: (value, ctx) => {
      return {
        d: ctx.parse(unparseSelections(value)),
      }
    },
    async: async (value, ctx) => {
      return {
        d: await ctx.parse(unparseSelections(value)),
      }
    },
    stream: (value, ctx) => {
      return {
        d: ctx.parse(unparseSelections(value)),
      }
    },
  },
  serialize: (node, ctx) => {
    const val = ctx.serialize(node.d)
    return `f.selections(${val})`
  },
  deserialize: (node, cxt) => {
    const res = parseSelections(cxt.deserialize(node.d))
    if (res.success) {
      return res.data
    } else {
      throw res.error
    }
  },
})

export const DehydrateData = () => {
  const queryClient = useQueryClient()
  const dehydratedQueryClient = dehydrate(queryClient)

  const router = useRouter()

  const data: DehydratedData = {
    queryClient: dehydratedQueryClient,
    links: router.options.context.links,
    scripts: router.options.context.scripts,
  }

  const serialized = serialize(data, {
    plugins: [dayjsPlugin, selectionsPlugin],
  })

  const script = `self.__ULE_DATA=(f=>${serialized});document.currentScript.remove()`
  return <script>{script}</script>
}

import { parseISO, parseSelections } from "@open-event-systems/schedule-lib"
import {
  hydrate,
  QueryClient,
  type DehydratedState,
} from "@tanstack/react-query"
import type { JSX } from "react/jsx-runtime"

export type DehydratedData = Readonly<{
  queryClient: DehydratedState
  links?: Iterable<JSX.IntrinsicElements["link"]>
  scripts?: Iterable<JSX.IntrinsicElements["script"]>
}>

declare global {
  var __ULE_DATA: (f: unknown) => DehydratedData
}

export const hydrateData = (): {
  queryClient: QueryClient
  links?: Iterable<JSX.IntrinsicElements["link"]>
  scripts?: Iterable<JSX.IntrinsicElements["script"]>
} => {
  const funcs = {
    dayjs: (value: string) => parseISO(value),
    selections: (value: unknown) => parseSelections(value),
  }

  const queryClient = new QueryClient()

  const hydratedData = self.__ULE_DATA(funcs)
  hydrate(queryClient, hydratedData.queryClient as DehydratedState)

  return {
    queryClient,
    links: hydratedData.links,
    scripts: hydratedData.scripts,
  }
}

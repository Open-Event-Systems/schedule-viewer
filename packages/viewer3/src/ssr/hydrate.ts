import {
  defaultHydrators,
  makeHydrator,
} from "@open-event-systems/schedule-react"
import type { DehydratedState } from "@tanstack/react-query"
import type { JSX } from "react/jsx-runtime"

type DehydratedData = Readonly<{
  queryClientData: DehydratedState
  meta: JSX.IntrinsicElements["meta"][]
  links: JSX.IntrinsicElements["link"][]
  scripts: JSX.IntrinsicElements["script"][]
}>

export const hydrate = makeHydrator<DehydratedData>()({
  ...defaultHydrators,
})

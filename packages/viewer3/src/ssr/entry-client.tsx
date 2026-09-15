import "@mantine/core/styles.css"

import "@open-event-systems/schedule-react/schedule-react.css"

import "../styles.scss"

import { rehydrate } from "@open-event-systems/schedule-react"
import {
  hydrate,
  QueryClient,
  type DehydratedState,
} from "@tanstack/react-query"
import { RouterClient } from "@tanstack/react-router/ssr/client"
import { StrictMode, type JSX } from "react"
import { hydrateRoot } from "react-dom/client"
import { getJSConfig, makeAppContext } from "../config/js-config.js"
import { createRouter } from "../router/router.js"

const jsConfig = getJSConfig()

const queryClient = new QueryClient()
const { queryClientData, links, scripts } = rehydrate<{
  queryClientData: DehydratedState
  links: JSX.IntrinsicElements["link"][]
  scripts: JSX.IntrinsicElements["script"][]
}>()
hydrate(queryClient, queryClientData)
const appContext = makeAppContext(jsConfig, queryClient, "ssr")
const router = createRouter(appContext, { links, scripts })

hydrateRoot(
  document,
  <StrictMode>
    <RouterClient router={router} />
  </StrictMode>,
)

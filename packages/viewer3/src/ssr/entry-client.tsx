import "@mantine/core/styles.css"

import "@open-event-systems/schedule-react/schedule-react.css"

import "../styles.scss"

import { hydrate } from "#src/ssr/hydrate.js"
import {
  hydrate as hydrateQueryClient,
  QueryClient,
} from "@tanstack/react-query"
import { RouterClient } from "@tanstack/react-router/ssr/client"
import { StrictMode } from "react"
import { hydrateRoot } from "react-dom/client"
import { getJSConfig, makeAppContext } from "../config/js-config.js"
import { createRouter } from "../router/router.js"

const jsConfig = getJSConfig()
const queryClient = new QueryClient()

const { queryClientData, meta, scripts, links } = hydrate()

hydrateQueryClient(queryClient, queryClientData)

const appContext = {
  ...makeAppContext(jsConfig, queryClient, "ssr"),
  meta,
  scripts,
  links,
}
const router = createRouter(appContext)

hydrateRoot(
  document,
  <StrictMode>
    <RouterClient router={router} />
  </StrictMode>,
)

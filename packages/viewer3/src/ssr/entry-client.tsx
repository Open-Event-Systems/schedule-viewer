import "@mantine/core/styles.css"
import "@open-event-systems/schedule-react/schedule-react.css"
import "../styles.scss"

import { RouterClient } from "@tanstack/react-router/ssr/client"
import { hydrateRoot } from "react-dom/client"
import { getJSConfig, makeAppContext } from "../config/js-config.js"
import { createRouter } from "../router/router.js"
import { hydrateData } from "./hydrate.js"
import { StrictMode } from "react"

const jsConfig = getJSConfig()

const { queryClient, links, scripts } = hydrateData()
const appContext = makeAppContext(jsConfig, queryClient, "ssr")
const router = createRouter(appContext, { links, scripts })

hydrateRoot(
  document,
  <StrictMode>
    <RouterClient router={router} />
  </StrictMode>,
)

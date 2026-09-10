import express from "express"
import { pipeline } from "node:stream/promises"

import { RouterProvider } from "@tanstack/react-router"
import {
  createRequestHandler,
  renderRouterToStream,
} from "@tanstack/react-router/ssr/server"
import { makeAppContext, type JSConfig } from "../config/js-config.js"
import { createRouter } from "../router/router.js"
import type { Manifest } from "vite"
import { QueryClient } from "@tanstack/react-query"
import { getManifestResources } from "./utils.js"
import { StrictMode } from "react"

export { getJSConfig } from "../config/js-config.js"

export const handleRequest = async (
  jsConfig: JSConfig,
  manifest: Manifest,
  entryPoint: string,
  request: express.Request,
  response: express.Response,
) => {
  const queryClient = new QueryClient()
  const appContext = makeAppContext(jsConfig, queryClient, "ssr")
  const { links, scripts } = getManifestResources(
    manifest,
    jsConfig.basePath,
    entryPoint,
  )

  const plainRequest = expressRequestToPlainRequest(appContext.origin, request)

  const handler = createRequestHandler({
    createRouter: () => createRouter(appContext, { links, scripts }),
    request: plainRequest,
  })

  const plainResponse = await handler(
    async ({ request, responseHeaders, router }) => {
      await router.load()
      return renderRouterToStream({
        request,
        router,
        responseHeaders,
        children: (
          <StrictMode>
            <RouterProvider router={router} />
          </StrictMode>
        ),
      })
    },
  )

  await sendPlainResponse(plainResponse, response)
}

const expressRequestToPlainRequest = (
  origin: string,
  expressRequest: express.Request,
): Request => {
  const headers = new Headers()

  for (const [k, v] of Object.entries(expressRequest.headers)) {
    headers.set(k, v as string)
  }

  const fullURL = new URL(expressRequest.originalUrl, origin)

  const req = new Request(fullURL, {
    method: expressRequest.method,
    headers: headers,
  })

  return req
}

const sendPlainResponse = async (
  response: Response,
  expressResponse: express.Response,
) => {
  expressResponse.status(response.status)
  expressResponse.statusMessage = response.statusText

  for (const [k, v] of response.headers.entries()) {
    expressResponse.appendHeader(k, v)
  }

  if (response.body) {
    await pipeline(response.body, expressResponse)
  } else {
    expressResponse.end()
  }
}

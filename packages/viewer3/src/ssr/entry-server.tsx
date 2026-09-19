import type { OriginString } from "@open-event-systems/schedule-react"
import { getManifestResources } from "@open-event-systems/schedule-react/server"
import { QueryClient } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import {
  createRequestHandler,
  renderRouterToStream,
} from "@tanstack/react-router/ssr/server"
import express from "express"
import { pipeline } from "node:stream/promises"
import { StrictMode } from "react"
import type { Manifest } from "vite"
import { makeAppContext, type JSConfig } from "../config/js-config.js"
import { createRouter } from "../router/router.js"

export { getJSConfig } from "../config/js-config.js"

export const handleRequest = async (
  jsConfig: JSConfig,
  manifest: Manifest,
  entryPoint: string,
  request: express.Request,
  response: express.Response,
) => {
  // TODO: double check where to get origin info from
  const host = request.host

  // TODO: set trusted proxies
  const origin = `${request.protocol}://${host}` as OriginString

  const queryClient = new QueryClient()

  const { links, scripts } = getManifestResources(
    manifest,
    jsConfig.basePath,
    entryPoint,
  )

  const appContext = {
    ...makeAppContext(jsConfig, queryClient, "ssr"),
    origin,
    links,
    scripts,
  }

  const plainRequest = expressRequestToPlainRequest(origin, request)

  const handler = createRequestHandler({
    createRouter: () => createRouter(appContext),
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

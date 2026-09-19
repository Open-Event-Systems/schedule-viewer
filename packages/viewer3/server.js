import express from "express"
import fs from "fs/promises"
import vm from "vm"

const isProd = process.env.NODE_ENV == "production"

const createDevServer = async () => {
  const app = express()

  const vite = await import("vite")
  const viteServer = await vite.createServer({
    server: {
      middlewareMode: true,
    },
    appType: "custom",
  })

  app.use(viteServer.middlewares)

  /**
   * @type {{getJSConfig: import("./src/config/js-config.js").getJSConfig}}
   */
  const { getJSConfig } = await viteServer.ssrLoadModule(
    "src/ssr/entry-server.tsx",
  )
  const configJsStr = await fs.readFile("./public/config.js", {
    encoding: "utf-8",
  })
  const ctx = vm.createContext()
  vm.runInContext(configJsStr, ctx)
  const jsConfig = getJSConfig(ctx.ULE_CONFIG)

  /**
   * @type {{handleRequest: import("./src/ssr/entry-server.js").handleRequest}}
   */
  const { handleRequest } = await viteServer.ssrLoadModule(
    "src/ssr/entry-server.tsx",
  )

  app.use("*all", async (request, response, next) => {
    try {
      await handleRequest(
        jsConfig,
        {},
        "src/ssr/entry-client.tsx",
        request,
        response,
      )
    } catch (e) {
      viteServer.ssrFixStacktrace(e)
      console.error(e)
      next(e.stack)
    }
  })

  app.listen(5173)
}

const createProdServer = async () => {
  const app = express()

  /**
   * @type {{getJSConfig: import("./src/ssr/entry-server.js").getJSConfig}}
   */
  const { getJSConfig } = await import("./dist/server/entry-server.js")
  const configJsStr = await fs.readFile("./dist/client/config.js", {
    encoding: "utf-8",
  })
  const ctx = vm.createContext()
  vm.runInContext(configJsStr, ctx)
  const jsConfig = getJSConfig(ctx.ULE_CONFIG)

  const manifestModule = await import("./dist/client/.vite/manifest.json", {
    with: { type: "json" },
  })

  const manifest = manifestModule.default

  /**
   * @type {{handleRequest: import("./src/ssr/entry-server.js").handleRequest}}
   */
  const { handleRequest } = await import("./dist/server/entry-server.js")

  app.use(express.static("./dist/client"))

  app.use("*all", async (request, response) => {
    try {
      await handleRequest(
        jsConfig,
        manifest,
        "src/ssr/entry-client.tsx",
        request,
        response,
      )
    } catch (e) {
      console.error(e)
      response.status(500).end()
    }
  })

  app.listen(5173)
}

if (isProd) {
  createProdServer()
} else {
  createDevServer()
}

import express from "express"
import fs from "fs/promises"
import vm from "vm"

const isProd = process.env.NODE_ENV == "production"

const createServer = async () => {
  const app = express()
  /**
   * @type {import("vite").ViteDevServer}
   */
  let viteServer

  if (!isProd) {
    const vite = await import("vite")
    viteServer = await vite.createServer({
      configFile: "vite.ssr.config.ts",
      server: {
        middlewareMode: true,
      },
      appType: "custom"
    })

    app.use(viteServer.middlewares)
  }

  /**
   * @type {import("./src/config/js-config.js").JSConfig}
   */
  let jsConfig

  if (!isProd) {
    /**
     * @type {import("./src/ssr/entry-server.js")}
     */
    const { getJSConfig } = await viteServer.ssrLoadModule("src/ssr/entry-server.tsx")
    const configJsStr = await fs.readFile("./public/config.js", { encoding: "utf-8" })
    const ctx = vm.createContext()
    vm.runInContext(configJsStr, ctx)
    jsConfig = getJSConfig(ctx.ULE_CONFIG)
    jsConfig = { ...jsConfig, origin: "http://localhost:5173" }
  } else {
    /**
     * @type {import("./src/ssr/entry-server.js")}
     */
    const { getJSConfig } = await import("./dist/server/entry-server.js")
    const configJsStr = await fs.readFile("./dist/client/config.js", { encoding: "utf-8" })
    const ctx = vm.createContext()
    vm.runInContext(configJsStr, ctx)
    jsConfig = getJSConfig(ctx.ULE_CONFIG)
    jsConfig = { ...jsConfig, origin: "http://localhost:5173" }
  }

  /**
   * @type {import("vite").Manifest}
   */
  let manifest = {}

  if (isProd) {
    const manifestData = await import("./dist/client/.vite/manifest.json", { with: { type: "json" } })
    manifest = manifestData.default

    app.use(express.static("./dist/client"))
  }

  app.use("*all", async (request, response, next) => {
    /**
     * @type {import("./src/ssr/entry-server.js").handleRequest}
     */
    let handleRequest

    try {

      if (!isProd) {
        /**
         * @type {import("./src/ssr/entry-server.js")}
         */
        const handlerModule = await viteServer.ssrLoadModule("src/ssr/entry-server.tsx")
        handleRequest = handlerModule.handleRequest
      } else {
        /**
         * @type {import("./src/ssr/entry-server.js")}
         */
        const handlerModule = await import("./dist/server/entry-server.js")
        handleRequest = handlerModule.handleRequest
      }

      await handleRequest(jsConfig, manifest, "src/ssr/entry-client.tsx", request, response)

    } catch (e) {
      if (!isProd) {
        viteServer.ssrFixStacktrace(e)
      }
      console.error(e)
      next(e.stack)
    }

  })

  app.listen(5173)
}

createServer()
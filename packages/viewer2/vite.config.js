import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import { analyzer } from "vite-bundle-analyzer"

import packageJSON from "./package.json"

export default defineConfig({
  base: "",
  build: {
    target: "es2017",
    // rolldownOptions: {
    //   onwarn: (warning, handler) => {
    //     // suppress warning about "use client"
    //     if (warning.code != "MODULE_LEVEL_DIRECTIVE") {
    //       handler(warning)
    //     }
    //   },
    // },
  },
  define: {
    __VIEWER_VERSION__: JSON.stringify(packageJSON.version),
  },
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    VitePWA({
      injectRegister: false,
      manifest: false,
      workbox: {
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: (options) => {
              const url = options.url
              return (
                options.request.method == "GET" &&
                (url.pathname.endsWith("/config.js") ||
                  url.pathname.endsWith("/config.json") ||
                  url.pathname.endsWith("/custom.css") ||
                  /\.(?:json|css|png|svg|jpe?g|webp|woff2)$/i.test(
                    url.pathname,
                  ) ||
                  /\/schedules\/[^/]+\/selections\/[a-z0-9_-]+$/i.test(
                    url.pathname,
                  ) ||
                  url.searchParams.has("_swCache"))
              )
            },
            handler: "NetworkFirst",
          },
        ],
        navigateFallbackDenylist: [
          /\.(?:html|js|json|css|png|svg|jpe?g|webp|woff2)$/i,
        ],
        globPatterns: ["**/*.{html,js,css,png,svg,jpg,jpeg,webp,woff2}"],
        globIgnores: ["config.js", "config.json", "custom.css"],
      },
    }),
    analyzer({}),
    // Insert custom css tag at end of head
    // https://stackoverflow.com/a/79359524
    {
      name: "move-custom-css-to-end",
      transformIndexHtml() {
        return [
          {
            tag: "link",
            attrs: {
              rel: "stylesheet",
              href: "/custom.css",
            },
            injectTo: "head",
          },
        ]
      },
    },
    {
      name: "append-version",
      transformIndexHtml(html) {
        return html + `\n<!-- ULE v${packageJSON.version} -->`
      },
    },
  ],
})

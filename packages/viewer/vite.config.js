import { defineConfig } from "vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import babel from "@rolldown/plugin-babel"
import { VitePWA } from "vite-plugin-pwa"

import packageJSON from "./package.json"

export default defineConfig({
  base: "/test-schedule-2026",
  build: {
    target: "es2017",
    rolldownOptions: {
      plugins: [],
      experimental: {
        lazyBarrel: true,
      },
      treeshake: {
        moduleSideEffects: [
          {
            test: /\.s?css$/,
            sideEffects: true,
          },
        ],
      },
      output: {
        // strictExecutionOrder: true,
        codeSplitting: {
          maxSize: 500000,
          groups: [
            {
              name: "vendor",
              test: /node_modules/,
              entriesAware: true,
            },
            {
              name: "app",
              test: /[\\/]packages[\\/](?:react|lib|map)[\\/]/,
              entriesAware: true,
            },
          ],
        },
      },
    },
  },
  define: {
    __VIEWER_VERSION__: JSON.stringify(packageJSON.version),
  },
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()],
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
                  url.pathname.endsWith("/map.css") ||
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
        globIgnores: ["config.js", "config.json", "custom.css", "map.css"],
      },
    }),
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
              href: "/test-schedule-2026/custom.css",
            },
            injectTo: "head",
          },
          {
            tag: "link",
            attrs: {
              rel: "stylesheet",
              href: "/test-schedule-2026/map.css",
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
  experimental: {
    renderBuiltUrl: (filename, opts) => {
      if (opts.hostType == "js" || opts.hostType == "css") {
        return { relative: true }
      }
    },
  },
})

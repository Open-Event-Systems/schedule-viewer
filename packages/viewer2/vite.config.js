import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  build: {
    target: "es2017",
    rollupOptions: {
      onwarn: (warning, handler) => {
        // suppress warning about "use client"
        if (warning.code != "MODULE_LEVEL_DIRECTIVE") {
          handler(warning)
        }
      },
    },
  },
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
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
              href: "/custom.css",
            },
            injectTo: "head",
          },
        ]
      },
    },
  ],
})

import { defineConfig } from "vite"
import dtsPlugin from "vite-plugin-dts"
import react from "@vitejs/plugin-react"

import packageJson from "./package.json" with { type: "json" }

const deps = [
  ...Object.keys(packageJson.dependencies),
  ...Object.keys(packageJson.peerDependencies),
]

export default defineConfig({
  build: {
    target: "esnext",
    lib: {
      entry: "./src/index.ts",
      formats: ["es"],
    },
    rolldownOptions: {
      external(source) {
        return deps.some((d) => source.startsWith(d))
      },
    },
  },
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    dtsPlugin({
      exclude: ["**/*.stories.*"],
    }),
  ],
})

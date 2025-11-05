import { defineConfig } from "vite"
import dtsPlugin from "vite-plugin-dts"

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
    rollupOptions: {
      external(source) {
        return deps.some((d) => source.startsWith(d))
      },
    },
  },
  plugins: [
    dtsPlugin({
      exclude: ["**/*.stories.*"],
    }),
  ],
})

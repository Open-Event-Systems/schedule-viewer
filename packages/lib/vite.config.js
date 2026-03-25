import { defineConfig } from "vite"

import packageJson from "./package.json" with { type: "json" }
import dtsPlugin from "vite-plugin-dts"

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
      output: {
        preserveModules: true,
        entryFileNames: "[name].js",
      },
      external(source) {
        return deps.some((d) => source.startsWith(d))
      },
    },
  },
  plugins: [
    dtsPlugin({
      exclude: "**/*.test.*",
    }),
  ],
})

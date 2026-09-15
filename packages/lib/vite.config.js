import { defineConfig } from "vite"

import dtsPlugin from "unplugin-dts/vite"
import packageJson from "./package.json" with { type: "json" }

const deps = [
  ...Object.keys(packageJson.dependencies),
  ...Object.keys(packageJson.peerDependencies),
]

export default defineConfig({
  build: {
    target: "esnext",
    lib: {
      entry: {
        index: "./src/index.ts",
        serialization: "./src/serialization.ts",
        "test-data": "./src/test-data.ts",
      },
      formats: ["es"],
    },
    rolldownOptions: {
      output: {
        preserveModules: true,
        entryFileNames: "src/[name].js",
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

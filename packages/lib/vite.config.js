import { defineConfig } from "vite"

import dtsPlugin from "unplugin-dts/vite"

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
      external: [/^[^#/.]/],
    },
  },
  plugins: [
    dtsPlugin({
      exclude: "**/*.test.*",
    }),
  ],
})

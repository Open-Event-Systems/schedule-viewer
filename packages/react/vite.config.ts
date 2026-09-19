import react from "@vitejs/plugin-react"
import dtsPlugin from "unplugin-dts/vite"
import { defineConfig } from "vite"

export default defineConfig({
  build: {
    target: "esnext",
    lib: {
      entry: {
        index: "./src/index.ts",
        server: "./src/server.ts",
        "test-data-new": "./src/test-data-new.ts",
        "vite-scripts": "./src/vite-scripts.ts",
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
    react({ compiler: true }),
    dtsPlugin({
      exclude: ["**/*.stories.*", ".storybook/**"],
    }),
  ],
})

import react from "@vitejs/plugin-react"
import dtsPlugin from "unplugin-dts/vite"
import { defineConfig } from "vite"

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
        entryFileNames: "src/[name].js",
      },
      external: [/^[^#./]/],
    },
  },
  plugins: [
    react({ compiler: true }),
    dtsPlugin({
      exclude: ["**/*.stories.*", ".storybook/**"],
    }),
  ],
})

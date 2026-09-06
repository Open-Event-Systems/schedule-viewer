import { defineConfig } from "vite"
import dtsPlugin from "unplugin-dts/vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import babel from "@rolldown/plugin-babel"

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
    react({}),
    babel({
      presets: [reactCompilerPreset()],
    }),
    dtsPlugin({
      exclude: ["**/*.stories.*"],
    }),
  ],
})

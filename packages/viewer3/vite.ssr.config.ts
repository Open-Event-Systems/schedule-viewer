import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig(({ isSsrBuild }) => ({
  base: "/",
  build: isSsrBuild ? {
    ssr: true,
    outDir: "dist/server",
    copyPublicDir: false,
    rolldownOptions: {
      input: path.resolve("src/ssr/entry-server.tsx"),
    }
  } : {
    target: "es2017",
    outDir: "dist/client",
    manifest: true,
    ssrManifest: true,
    rolldownOptions: {
      input: path.resolve("src/ssr/entry-client.tsx"),
    }
  },
  plugins: [
    react(),
  ]
}))
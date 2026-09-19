import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"

export default defineConfig(({ isSsrBuild }) => ({
  base: "/",
  build: isSsrBuild
    ? {
        ssr: true,
        outDir: "dist/server",
        copyPublicDir: false,
        rolldownOptions: {
          input: path.resolve("src/ssr/entry-server.tsx"),
        },
      }
    : {
        target: "es2017",
        outDir: "dist/client",
        manifest: true,
        ssrManifest: true,
        rolldownOptions: {
          input: {
            client: path.resolve("src/ssr/entry-client.tsx"),
            spa: path.resolve("index.html"),
          },
        },
      },
  plugins: [react({ compiler: true })],
}))

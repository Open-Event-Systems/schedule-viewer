import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig(() => ({
  build: {
    target: "es2017"
  },
  plugins: [
    react()
  ]
}))
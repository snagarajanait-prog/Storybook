import path from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Allow access over an ngrok tunnel (otherwise Vite returns
  // "Blocked request. This host is not allowed."). host:true also
  // binds to the LAN so the tunnel can reach it.
  server: { host: true, allowedHosts: true },
  preview: { host: true, allowedHosts: true },
})

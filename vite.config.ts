
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: "/Carvy/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),  // 👈 Ensure `@` maps to `/src`
    },
  },
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
}))

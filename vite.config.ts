
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { componentTagger } from "lovable-tagger"

export default defineConfig(({ mode }) => ({
  base: "/Carvy/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),  // 👈 Ensure `@` maps to `/src`
    },
  },
  server: {
    port: 8080,
    host: "::"
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
}))

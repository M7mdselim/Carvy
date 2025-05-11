
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
    port: 8080,
    allowedHosts: [
      "0cdc32f2-343c-4fd4-8142-8d9facac6399.lovableproject.com"
    ]
  },
  
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
}))

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: "/Carvy/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),  // 👈 Ensure `@` maps to `/src`
    },
  },
  plugins: [react()],
})

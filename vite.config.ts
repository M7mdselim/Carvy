import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Carvy/', // This should match the repository name
  plugins: [react()],
})

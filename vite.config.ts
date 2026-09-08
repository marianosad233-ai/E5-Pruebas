import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/E5-Pruebas/', // GitHub Pages repository name
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})

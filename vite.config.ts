import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.', 
  publicDir: 'public', 
  build: {
    outDir: 'dist', 
    emptyOutDir: true, 
  },
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 4000, 
    open: false,
  },
})
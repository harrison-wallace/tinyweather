import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.', 
  publicDir: 'public', 
  build: {
    outDir: 'dist', 
    emptyOutDir: true,
    target: 'esnext', 
    minify: 'esbuild', 
    sourcemap: false, 
    rollupOptions: {
      input: './public/index.html',
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'axios'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0', 
    port: 5173,
    open: false,
    strictPort: false, 
  },
})
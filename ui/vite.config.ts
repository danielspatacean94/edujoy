import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: __dirname,
  // Keep this app's optimized dependencies separate from the old skeleton cache.
  cacheDir: path.resolve(__dirname, '../node_modules/.vite-edujoy'),
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  optimizeDeps: {
    // Build the renderer and hook consumers together before serving the app.
    include: ['react', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'zustand', 'zustand/middleware', 'react-router-dom'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../dist/ui'),
    emptyOutDir: true,
  },
})

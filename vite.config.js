import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    // Custom plugin to handle SPA fallback for deep links
    {
      name: 'spa-fallback',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Only handle GET requests that aren't API calls or static files
          if (req.method === 'GET' && 
              !req.url.startsWith('/api') && 
              !req.url.startsWith('/src') &&
              !req.url.includes('.') &&
              !req.url.includes('hot') &&
              !req.url.includes('vite')) {
            // Rewrite to index.html for SPA routing
            req.url = '/index.html'
          }
          next()
        })
      }
    }
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
})

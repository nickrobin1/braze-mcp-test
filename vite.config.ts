import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      protocol: 'http',
      host: 'localhost',
      port: 8888,
      clientPort: 8888
    },
    watch: {
      usePolling: true
    }
  }
})

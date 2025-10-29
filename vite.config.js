import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    
    // Server configuration
    server: {
      port: 5173,
      strictPort: true,
      host: true,
    },

    // Define global constants for the app
    define: {
      // Make env variables available to the app
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
      'import.meta.env.VITE_API_TIMEOUT': JSON.stringify(env.VITE_API_TIMEOUT),
      'import.meta.env.VITE_API_DEBUG': JSON.stringify(env.VITE_API_DEBUG),
    },

    // Build optimizations
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'editor-vendor': ['@monaco-editor/react'],
          },
        },
      },
    },
  }
})

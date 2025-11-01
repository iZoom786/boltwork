import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
        headers: {
          'Content-Security-Policy': "script-src 'self' 'unsafe-eval';",
        },
      },
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

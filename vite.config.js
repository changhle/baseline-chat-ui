import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 2002,
    allowedHosts: [".ngrok-free.app", "chlee.postech.ac.kr"],
    watch: {
      usePolling: true,
    },
  },
});
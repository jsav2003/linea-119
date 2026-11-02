import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Three.js pesa ~830 kB, pero se carga aparte y solo después de mostrar la landing
    // (React.lazy en Landing.jsx), así que ese tamaño no frena la primera pantalla.
    chunkSizeWarningLimit: 900,
  },
})

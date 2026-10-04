import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    open: false,
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'mediapipe-vendor': ['@mediapipe/tasks-vision'],
          'animation-vendor': ['gsap', 'lenis'],
        },
      },
    },
  },
})

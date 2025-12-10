import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        chunkSizeWarningLimit: 1000, // Suppress warning slightly
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'framer-motion', 'firebase/app', 'firebase/firestore', 'firebase/auth'],
                    three: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing']
                }
            }
        }
    }
})

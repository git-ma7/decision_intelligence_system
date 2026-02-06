import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            input: {
                popup: resolve(__dirname, 'index.html'),
                background: resolve(__dirname, 'service-worker.js'),
                content: resolve(__dirname, 'content-script.js'),
            },
            output: {
                entryFileNames: '[name].js',
            }
        }
    }
})

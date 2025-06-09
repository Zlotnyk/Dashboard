import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	optimizeDeps: {
		exclude: ['lucide-react'],
	},
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'index.html'),
				lifestyle: resolve(__dirname, 'public/lifestyle.html')
			}
		}
	}
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	optimizeDeps: {
		exclude: ['lucide-react'],
	},
	build: {
		rollupOptions: {
			input: {
				main: 'index.html',
				lifestyle: 'public/lifestyle.html'
			}
		}
	}
})
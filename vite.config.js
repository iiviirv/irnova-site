import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set base to './' so the built site works on GitHub Pages, Netlify,
// or any subpath without further configuration.
export default defineConfig({
  plugins: [react()],
  base: './',
})

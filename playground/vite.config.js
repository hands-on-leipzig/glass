import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const playgroundDir = fileURLToPath(new URL('.', import.meta.url))
const glassDir = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig({
  root: playgroundDir,
  plugins: [vue()],
  server: {
    port: 6006,
    open: '/',
    fs: {
      allow: [glassDir],
    },
  },
  build: {
    outDir: fileURLToPath(new URL('../playground-dist', import.meta.url)),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        buttons: fileURLToPath(new URL('./stories/buttons.html', import.meta.url)),
      },
    },
  },
})

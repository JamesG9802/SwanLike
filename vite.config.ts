/// <reference types="vitest" />
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths';
import topLevelAwait from "vite-plugin-top-level-await";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    topLevelAwait()
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'json', 'html'],
      provider: "v8"
    }
  },
  build: {
    rollupOptions: {
      input: ['index.html', 'editor.html']
    }
  },
  base: "/SwanLike",
  // assetsInclude: "**/*.json"
})

import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    copyPublicDir: false,
    minify: "oxc",
    sourcemap: true,
    rolldownOptions: {
      output: {
        keepNames: true,
        minify: {
          mangle: true,
          compress: true,
          codegen: true,
        },
      },
    },
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'PAPER',
      fileName: 'index',
      formats: ['es'],
    },
  },
})

import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig(({ mode }) => {
  const minify = mode !== 'development';

  return {
    resolve: {
      tsconfigPaths: true,
    },
    build: {
      copyPublicDir: false,
      sourcemap: true,
      emptyOutDir: false,
      minify: minify ? 'oxc' : false,
      rolldownOptions: minify ? {
        output: {
          keepNames: true,
          minify: {
            mangle: true,
            compress: true,
            codegen: true,
          },
        },
      } : undefined,
      lib: {
        entry: resolve(import.meta.dirname, 'src/index.ts'),
        name: 'PAPER',
        fileName: minify ? 'paper.min' : 'paper',
        formats: ['es'],
      },
    },
  };
})

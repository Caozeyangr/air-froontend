import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cesium from 'vite-plugin-cesium'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    cesium()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // 解决 @zip.js/zip.js 的兼容性问题 - 使用 lib/zip.js 替代
      '@zip.js/zip.js/lib/zip-no-worker.js': path.resolve(__dirname, 'node_modules/@zip.js/zip.js/lib/zip.js')
    }
  },
  optimizeDeps: {
    include: ['@zip.js/zip.js'],
    esbuildOptions: {
      // 解决 Cesium 的 zip.js 导入问题
      plugins: [
        {
          name: 'cesium-zip-fix',
          setup(build) {
            build.onResolve({ filter: /@zip\.js\/zip\.js\/lib\/zip-no-worker\.js/ }, () => ({
              path: path.resolve(__dirname, 'node_modules/@zip.js/zip.js/lib/zip.js'),
              external: false
            }))
          }
        }
      ]
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist'
  }
})

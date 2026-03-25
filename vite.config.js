import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { CodeInspectorPlugin } from 'code-inspector-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    CodeInspectorPlugin({
      bundler: 'vite',
      editor: 'code'
    })
  ],
  resolve: {
    alias: {
      '@': resolve(fileURLToPath(new URL('.', import.meta.url)), 'src')
    }
  },
  server: {
    allowedHosts: true,
    host: '0.0.0.0',
    port: 3000,
    open: true,
    proxy: {
      // 开发环境代理配置 - 所有 /api 请求转发到本地 Gateway
      // Gateway 会根据路径前缀（/as, /us, /is 等）路由到对应的微服务
      '/api': {
        target: 'http://127.0.0.1:10010',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
        ws: true // 启用WebSocket代理
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // 生产环境构建优化
    rollupOptions: {
      output: {
        // 手动分包
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus'],
          axios: ['axios']
        }
      }
    },
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除 console
        drop_debugger: true
      }
    }
  },
  // 环境变量前缀
  envPrefix: 'VITE_'
})

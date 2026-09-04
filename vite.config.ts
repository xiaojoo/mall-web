import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'
// mock插件
import { viteMockServe } from 'vite-plugin-mock'

export default defineConfig(({ command, mode }) => {
  // 获取各种环境下的对应变量
  const env = loadEnv(mode, process.cwd())
  return {
    base: '/admin/',
    plugins: [
      vue(),
      // Element Plus 按需引入（组件自动导入 + 样式按需加载）
      AutoImport({
        resolvers: [ElementPlusResolver({ importStyle: false })],
        dts: 'src/auto-imports.d.ts',
      }),
      Components({
        // 本地组件仍走 components/index.ts 的全局注册，避免重复
        dirs: [],
        // 自动导入指令（v-loading / v-infinite-scroll 等）
        directives: true,
        resolvers: [ElementPlusResolver({ importStyle: false })],
        dts: 'src/components.d.ts',
      }),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
        symbolId: 'icon-[dir]-[name]',
        inject: 'body-first',
      }),
      // mock
      viteMockServe({
        mockPath: 'mock',
        enable: command === 'serve', // 仅在开发环境启用
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    // scss 全局变量
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/styles/variable" as *;`,
        },
      },
    },
    // 分包：把体积大的第三方库拆成独立 chunk，
    // 配合路由懒加载让首屏只加载必要代码，减轻刷新卡顿
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia'],
            echarts: [
              'echarts/core',
              'echarts/charts',
              'echarts/components',
              'echarts/renderers',
            ],
            'element-plus': ['element-plus'],
          },
        },
      },
    },
    // 代理跨域
    server: {
      // 固定 5174：与 mall-ui（5173）错开端口，避免同源共享 localStorage
      port: 5174,
      proxy: {
        [env.VITE_APP_BASE_API]: {
          target: env.VITE_SERVE,
          changeOrigin: true,
          // 不重写路径，保留 /api 前缀给网关路由
        },
      },
    },
  }
})

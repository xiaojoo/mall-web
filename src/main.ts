import { createApp } from 'vue'
import App from '@/App.vue'
// Element Plus 组件/指令/函数式 API（ElMessage 等）由
// unplugin-auto-import + unplugin-vue-components 自动导入（importStyle:false，
// 不按需注入组件样式，避免懒加载页面首次出现新组件样式时触发 vite 重新预构建+整页刷新）；
// 样式改为下方全量引入一次到位
import 'element-plus/dist/index.css'
// 暗色模式变量（html.dark 时生效，系统设置里可切换）
import 'element-plus/theme-chalk/dark/css-vars.css'
// svg插件需要配置代码
import 'virtual:svg-icons-register'
// 引入自定义插件对象：注册整个项目全局组件
import globalComponents from '@/components'
// 引入全局样式
import '@/assets/styles/index.scss'
// 引入路由
import router from '@/router'
// 引入仓库
import pinia from './store'
// 引入路由鉴权文件
import './permisstion.ts'
// 引入按钮权限指令
import { setupPermsDirective } from '@/directives/perms'

const app = createApp(App)

// 注册按钮权限指令
setupPermsDirective(app)

app.use(router)
app.use(globalComponents)
app.use(pinia)
app.mount('#app')

// ---- 全局 UI 小补丁 ----
// el-cascader filterable 的搜索输入框（.el-cascader__search-input）由 element-plus
// 内部渲染，无 id/name，触发 Chrome a11y 告警；输入框一出现在 DOM 就自动补 name。
let cascaderPatchScheduled = false
const patchCascaderSearchInput = () => {
  cascaderPatchScheduled = false
  document.querySelectorAll('input.el-cascader__search-input').forEach((el) => {
    if (!el.hasAttribute('name')) {
      el.setAttribute('name', 'cascader-search')
    }
  })
}
const cascaderObserver = new MutationObserver(() => {
  if (cascaderPatchScheduled) {
    return
  }
  cascaderPatchScheduled = true
  requestAnimationFrame(patchCascaderSearchInput)
})
cascaderObserver.observe(document.body, { childList: true, subtree: true })
patchCascaderSearchInput()

// console.log(import.meta.env)

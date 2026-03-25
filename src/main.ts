import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './shared/stores'
import ElementPlus from 'element-plus'
import { ElMessage } from 'element-plus'

// 引入全局样式
import './shared/assets/styles/design-tokens.css'
import './shared/assets/styles/global.css'
import './shared/assets/styles/element-theme.css'
import './shared/assets/styles/design-system.css'
import 'github-markdown-css/github-markdown.css'

// 引入模块化样式
import './shared/assets/styles/modules/auth.css'
import './shared/assets/styles/modules/items.css'

// 引入Element Plus中文语言包
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const app = createApp(App)

// 注册 Pinia
app.use(pinia)

// 注册Element Plus
app.use(ElementPlus, {
  locale: zhCn,
})

// 使用路由
app.use(router)

// 挂载应用
app.mount('#app')

// 添加全局错误处理
app.config.errorHandler = (err, _instance, info) => {
  console.error('Vue 错误:', err, info)
  ElMessage.error('应用发生错误，请刷新页面重试')
}

// 添加全局警告处理
app.config.warnHandler = (msg, _instance, trace) => {
  console.warn('Vue 警告:', msg, trace)
}
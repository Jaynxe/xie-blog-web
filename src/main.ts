import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import "element-plus/theme-chalk/dark/css-vars.css"
import "@/style/theme/css-vars.scss"
import "@/style/index.scss"
import "element-plus/theme-chalk/el-message.css"; // ElMessage是全局组件需要单独导入其样式
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(createPinia())
app.use(router)
app.mount('#app')

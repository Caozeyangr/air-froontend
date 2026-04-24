import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'

// mock 仅在显式开启时启用，避免影响瓦片/png等跨域资源请求
if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true') {
  await import('./mock/index.js')
}

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'

// 引入 mock 配置
import './mock/index.js' // 启用 mock 数据

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')

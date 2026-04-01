import { createRouter, createWebHistory } from 'vue-router'

// 导入页面组件
import Login from '../view/Login.vue'
import Home from '../view/Home.vue'

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login' // 默认重定向到登录页
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { requiresAuth: false } // 登录页不需要认证
    },
    {
      path: '/home',
      name: 'Home',
      component: Home,
      meta: { requiresAuth: true } // 首页需要认证
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login' // 404重定向到登录页
    }
  ]
})

// 路由守卫：检查登录状态
router.beforeEach((to, from, next) => {
  // 获取登录状态
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  
  // 如果目标路由需要认证但用户未登录，则重定向到登录页
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({
      path: '/login',
      query: { redirect: to.fullPath } // 保存原始目标路径，登录后跳转
    })
  } else {
    next()
  }
})

export default router
import { createRouter, createWebHistory } from 'vue-router'
import { applyTokenFromQuery } from '../utils/authToken.js'

// 导入页面组件
import Login from '../view/Login.vue'
import Home from '../view/Home.vue'
import Workstation from '../view/workstation.vue'
import MiningTask from '../view/MiningTask.vue'
import SampleStatistics from '../view/SampleStatistics.vue'
import AgentManagement from '../view/AgentManagement.vue'

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
      path: '/workstation',
      name: 'Workstation',
      component: Workstation,
      meta: { requiresAuth: true } // 工作站需要认证
    },
    {
      path: '/miningtask',
      name: 'MiningTask',
      component: MiningTask,
      meta: { requiresAuth: true } // 任务管理需要认证
    },
    {
      path: '/samplestatistics',
      name: 'SampleStatistics',
      component: SampleStatistics,
      meta: { requiresAuth: true } // 样本统计需要认证
    },
    {
      path: '/agentmanagement',
      name: 'AgentManagement',
      component: AgentManagement,
      meta: { requiresAuth: true } // 智能体管理需要认证
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login' // 404重定向到登录页
    }
  ]
})

// 路由守卫：检查登录状态
router.beforeEach((to, from, next) => {
  // iframe：父页面在地址栏带 ?token= / ?toekn= 时，必须先落库再判登录，否则会进 /login 丢掉 token
  const hadTokenInUrl = applyTokenFromQuery(to.query)
  if (hadTokenInUrl) {
    const q = { ...to.query }
    delete q.token
    delete q.toekn
    return next({ path: to.path, query: q, hash: to.hash, replace: true })
  }

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

  if (to.meta.requiresAuth && !isLoggedIn) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
})

export default router
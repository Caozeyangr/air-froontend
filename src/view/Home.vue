<template>
  <div class="app-container">
    <div class="viewport">
      <div class="stage" :style="stageStyle">
        <img :src="bgImage" alt="背景" class="page-bg" />
        <header class="app-header">
          <img :src="headerImage" alt="顶部标题栏" class="header-image" />
        </header>
        <LeftPanel
          :sample-set="dashboardStats.sampleSet"
          :sample-count="dashboardStats.sampleCount"
          :resource-metrics="resourceMetrics"
        />
        <RightPanel
          :model-count="dashboardStats.modelCount"
          :workflow-list="dashboardStats.workflowList"
        />
        <main class="app-main">
          <CesiumViewer />
          <BeijingRadiationMap v-if="showRadiation" class="echarts-overlay" />
        </main>
        <AIChatInput />
        <BottomNavigation />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, reactive } from 'vue'
import CesiumViewer from '../components/CesiumViewer.vue'
import BeijingRadiationMap from '../components/BeijingRadiationMap.vue'
import LeftPanel from '../components/leftPanel/index.vue'
import RightPanel from '../components/rightPanel/index.vue'
import AIChatInput from '../components/AIChatInput.vue'
import BottomNavigation from '../components/BottomNavigation.vue'
import { getApiToken, redirectToLogin } from '../utils/authToken.js'
import headerImage from '../assets/header/顶部标题栏.png'
import bgImage from '../assets/bg/底部背景2.png'

const dashboardStats = reactive({
  sampleSet: [],
  sampleCount: 0,
  modelCount: 0,
  workflowList: []
})
const resourceMetrics = reactive({
  cpu: 0,
  memory: 0,
  gpu: 0
})

onMounted(() => {
  // 检查token是否存在，不存在则重定向到登录页
  checkTokenAndRedirect()
  getDashboardStats()
  getResourceMetrics()
})

onBeforeUnmount(() => {
})
// 检查token并处理重定向
function checkTokenAndRedirect() {
  const token = getApiToken()
  if (!token || token.trim() === '') {
    redirectToLogin('请先登录')
  }
}

const getDashboardStats = async () => {
  try {
    const token = getApiToken()
    if (!token) {
      redirectToLogin('请先登录')
      return
    }
    const response = await fetch('https://ib.cangling.cn:22002/api/v1/ars/getDashboardStats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'API-TOKEN': token
      }
    })
    const result = await response.json()
    if (!response.ok) {
      console.warn('getDashboardStats HTTP 错误:', response.status, result?.message || result?.code || '')
      // 检查是否是登录权限错误
      if (result?.message?.includes('需要登录权限') || response.status === 401) {
        redirectToLogin('登录已过期，请重新登录')
      }
      return
    }
    if (!result?.success) {
      console.warn('getDashboardStats 失败:', result?.message || '未知错误')
      // 检查是否是登录权限错误
      if (result?.message?.includes('需要登录权限')) {
        redirectToLogin('登录已过期，请重新登录')
      }
      return
    }
    const data = result.data || {}
    dashboardStats.sampleSet = Array.isArray(data.sampleSet) ? data.sampleSet : []
    dashboardStats.sampleCount = Number(data.sampleCount || 0)
    dashboardStats.modelCount = Number(data.modelCount || 0)
    dashboardStats.workflowList = Array.isArray(data.workflowList) ? data.workflowList : []
  } catch (e) {
    console.warn('getDashboardStats 请求异常', e)
  }
}

const getResourceMetrics = async () => {
  try {
    const token = getApiToken()
    if (!token) {
      redirectToLogin('请先登录')
      return
    }
    const response = await fetch('https://ib.cangling.cn:22002/api/v1/ars/getResourceMetrics', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'API-TOKEN': token
      }
    })
    const result = await response.json()
    if (!response.ok) {
      console.warn('getResourceMetrics HTTP 错误:', response.status, result?.message || result?.code || '')
      // 检查是否是登录权限错误
      if (result?.message?.includes('需要登录权限') || response.status === 401) {
        redirectToLogin('登录已过期，请重新登录')
      }
      return
    }
    if (!result?.success) {
      console.warn('getResourceMetrics 失败:', result?.message || '未知错误')
      // 检查是否是登录权限错误
      if (result?.message?.includes('需要登录权限')) {
        redirectToLogin('登录已过期，请重新登录')
      }
      return
    }
    const data = result.data || {}
    resourceMetrics.cpu = Number(data.cpu ?? 0)
    resourceMetrics.memory = Number(data.memory ?? 0)
    resourceMetrics.gpu = Number(data.gpu ?? 0)
  } catch (e) {
    console.warn('getResourceMetrics 请求异常', e)
  }
}

const stageStyle = computed(() => ({
  width: '100%',
  height: '100%',
  position: 'relative'
}))

// 登录后主页面默认展示辐射效果；如需临时关闭，可加 ?radiation=0
const showRadiation = computed(() => {
  if (typeof window === 'undefined') return true
  const params = new URLSearchParams(window.location.search || '')
  return params.get('radiation') !== '0'
})
</script>

<style scoped>
.app-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.viewport {
  position: fixed;
  inset: 0;
  overflow: hidden;
}

.stage {
  width: 100%;
  height: 100%;
}

.page-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
  user-select: none;
  z-index: 9;
}

.app-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 111px;
  overflow: hidden;
  z-index: 100;
  pointer-events: none;
}

.header-image {
  width: 100%;
  height: 100%;
  object-fit: fill;
  object-position: center;
}

.app-main {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.echarts-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  pointer-events: none;
}
</style>
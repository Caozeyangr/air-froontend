<template>
  <div class="app-container">
    <div class="viewport">
      <div class="stage" :style="stageStyle">
        <img :src="bgImage" alt="背景" class="page-bg" />
        <header class="app-header">
          <img :src="headerImage" alt="顶部标题栏" class="header-image" />
        </header>
        <LeftPanel />
        <RightPanel />
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import CesiumViewer from '../components/CesiumViewer.vue'
import BeijingRadiationMap from '../components/BeijingRadiationMap.vue'
import LeftPanel from '../components/leftPanel/index.vue'
import RightPanel from '../components/rightPanel/index.vue'
import AIChatInput from '../components/AIChatInput.vue'
import BottomNavigation from '../components/BottomNavigation.vue'
import headerImage from '../assets/header/顶部标题栏.png'
import bgImage from '../assets/bg/底部背景2.png'

const STAGE_W = 1920
const STAGE_H = 960
const shift = ref({ x: 0, y: 0 })
const scaleRef = ref(1)
const posRef = ref({ left: 0, top: 0 })

function updateStage() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const scale = Math.min(vw / STAGE_W, vh / STAGE_H)
  scaleRef.value = scale
  const w = STAGE_W * scale
  const h = STAGE_H * scale
  posRef.value = {
    left: (vw - w) / 2 + shift.value.x,
    top: (vh - h) / 2 + shift.value.y
  }
}

onMounted(() => {
  updateStage()
  window.addEventListener('resize', updateStage)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateStage)
})

const stageStyle = computed(() => ({
  width: `${STAGE_W}px`,
  height: `${STAGE_H}px`,
  position: 'absolute',
  left: `${posRef.value.left}px`,
  top: `${posRef.value.top}px`,
  transform: `scale(${scaleRef.value})`,
  transformOrigin: 'top left'
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
  position: absolute;
}

.page-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 1920px;
  height: 960px;
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
  height: 80px;
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
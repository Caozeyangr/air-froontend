<!-- <template>
  <div class="app-container"> -->
    <!-- 页面背景图 -->
    <!-- <img :src="bgImage" alt="背景" class="page-bg" /> -->
    
    <!-- 顶部标题栏 -->
    <!-- <header class="app-header">
      <img :src="headerImage" alt="顶部标题栏" class="header-image" />
    </header> -->
    
    <!-- 左侧面板 -->
    <!-- <LeftPanel /> -->
    
    <!-- 右侧面板 -->
    <!-- <RightPanel /> -->
    
    <!-- 主内容区 -->
    <!-- <main class="app-main">
      <CesiumViewer />
    </main> -->
    
    <!-- AI 聊天输入框 -->
    <!-- <AIChatInput /> -->
    
    <!-- 底部导航组件 -->
    <!-- <BottomNavigation />
  </div>
</template> -->

<template>
  <div class="app-container">
    <div class="viewport">
      <div class="stage" :style="stageStyle">
        <!-- 页面背景图 -->
        <img :src="bgImage" alt="背景" class="page-bg" />

        <!-- 顶部标题栏 -->
        <header class="app-header">
          <img :src="headerImage" alt="顶部标题栏" class="header-image" />
        </header>

        <!-- 左侧面板 -->
        <LeftPanel />

        <!-- 右侧面板 -->
        <RightPanel />

        <!-- 主内容区 -->
        <main class="app-main">
          <CesiumViewer />
          <BeijingRadiationMap v-if="showEchartsMap" class="echarts-overlay" />
        </main>

        <!-- AI 聊天输入框 -->
        <AIChatInput />

        <!-- 底部导航组件 -->
        <BottomNavigation />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import CesiumViewer from './components/CesiumViewer.vue'
import BeijingRadiationMap from './components/BeijingRadiationMap.vue'
import LeftPanel from './components/leftPanel/index.vue'
import RightPanel from './components/rightPanel/index.vue'
import AIChatInput from './components/AIChatInput.vue'
import BottomNavigation from './components/BottomNavigation.vue'
import headerImage from './assets/header/顶部标题栏.png'
import bgImage from './assets/bg/底部背景2.png'

// 固定舞台尺寸（与你标准 HTML 的 1920x960 对齐）
const STAGE_W = 1920
const STAGE_H = 960
// 用于微调整体平移（先保持 0，后面对齐左侧标题栏时再改）
const shift = ref({ x: 0, y: 0 })
const scaleRef = ref(1)
const posRef = ref({ left: 0, top: 0 })
function updateStage() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  // 舞台等比缩放
  const scale = Math.min(vw / STAGE_W, vh / STAGE_H)
  scaleRef.value = scale
  // 缩放后实际占用大小
  const w = STAGE_W * scale
  const h = STAGE_H * scale
  // 居中定位 + 微调
  posRef.value = {
    left: (vw - w) / 2 + shift.value.x,
    top: (vh - h) / 2 + shift.value.y,
  }
}
onMounted(() => {
  updateStage()
  window.addEventListener('resize', updateStage)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateStage)
})
// 舞台最终样式：固定尺寸 + 居中 + 缩放
const stageStyle = computed(() => ({
  width: `${STAGE_W}px`,
  height: `${STAGE_H}px`,
  position: 'absolute',
  left: `${posRef.value.left}px`,
  top: `${posRef.value.top}px`,
  transform: `scale(${scaleRef.value})`,
  transformOrigin: 'top left',
}))

const showEchartsMap = computed(() => {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search || '')
  return params.get('echartsMap') === '1'
})
</script>

<style scoped>
.app-container {
  /* position: relative; */
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}


/* 占满视口，给 stage 用 */
.viewport {
  position: fixed;
  inset: 0;
  overflow: hidden;
}
/* 舞台容器本身（舞台的 left/top/scale 在 stageStyle 动态控制） */
.stage {
  position: absolute;
}

/* 页面背景图：100%宽高，无法选中，鼠标穿透可点到cesium */
.page-bg {
  /* position: fixed; */
  position: absolute;
  top: 0;
  left: 0;
  width: 1920px;
  height: 960px;
  /* width: 100%;
  height: 100%; */
  /* object-fit: cover; */
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
  /* object-fit: cover; */
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
  z-index: 5;
  pointer-events: none; /* 不挡住底层 Cesium 点击/拖拽 */
}
</style>

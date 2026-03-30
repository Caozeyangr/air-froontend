<template>
  <div class="app-container">
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
    </main>
    
    <!-- AI 聊天输入框 -->
    <AIChatInput />
    
    <!-- 底部导航组件 -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import CesiumViewer from './components/CesiumViewer.vue'
import LeftPanel from './components/leftPanel/index.vue'
import RightPanel from './components/rightPanel/index.vue'
import AIChatInput from './components/AIChatInput.vue'
import BottomNavigation from './components/BottomNavigation.vue'
import headerImage from './assets/header/顶部标题栏.png'
import bgImage from './assets/bg/底部背景2.png'
</script>

<style scoped>
.app-container {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* 页面背景图：100%宽高，无法选中，鼠标穿透可点到cesium */
.page-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  object-fit: cover;
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
</style>

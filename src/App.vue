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
    <!-- 使用router-view显示当前路由组件 -->
    <router-view />
  </div>
</template>

<script setup>
// 路由组件由router-view自动加载
</script>

<style scoped>
.app-container {
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

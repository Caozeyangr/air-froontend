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
  /* 高于 page-bg(9)，低于左右面板(50)/AI(200)/底部导航(1000) */
  z-index: 20;
  pointer-events: none; /* 不挡住底层 Cesium 点击/拖拽 */
}
</style>

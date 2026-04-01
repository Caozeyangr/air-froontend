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
</style>

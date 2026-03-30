<template>
  <div class="sample-library-stats">
    <!-- 标题 -->
    <div class="title-bar">
      <span class="title-text">智能解译样本库统计</span>
    </div>
    
    <!-- 弹幕区域 -->
    <div class="danmaku-container">
      <div 
        v-for="(tag, index) in displayedTags" 
        :key="index"
        class="danmaku-tag"
        :style="getTagStyle(index)"
      >
        {{ tag }}
      </div>
    </div>
    
    <!-- 底座 -->
    <img 
      :src="baseImage" 
      alt="底座" 
      class="base-image"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import baseImage from '../../assets/left/底座2.png'

const tags = ref([])
const displayedTags = ref([])

onMounted(async () => {
  // 加载词条
  const response = await fetch('/tags.json')
  tags.value = await response.json()
  
  // 初始化显示词条
  displayedTags.value = [...tags.value]
})

// 获取词条样式
function getTagStyle(index) {
  const rows = 3
  const row = index % rows
  const baseTop = 20 + row * 40
  const baseDelay = index * 2
  
  return {
    top: `${baseTop}px`,
    animationDelay: `${baseDelay}s`,
    animationDuration: `${15 + Math.random() * 5}s`
  }
}
</script>

<style scoped>
.sample-library-stats {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 标题栏 */
.title-bar {
  width: 388px;
  height: 32px;
  padding: 0 16px;
  background: linear-gradient(90deg, #42ACFF 0%, rgba(211,235,255,0) 100%);
  text-align: left;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.title-text {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* 弹幕容器 */
.danmaku-container {
  position: relative;
  width: 100%;
  height: 140px;
  overflow: hidden;
  margin-bottom: 8px;
}

/* 弹幕词条 */
.danmaku-tag {
  position: absolute;
  left: 100%;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(24, 144, 255, 0.3);
  border-radius: 20px;
  font-size: 13px;
  color: #1890ff;
  white-space: nowrap;
  animation: danmakuMove linear infinite;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
}

@keyframes danmakuMove {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(-100% - 300px));
  }
}

/* 底座图片 */
.base-image {
  width: 100%;
  height: 60px;
  object-fit: contain;
}
</style>

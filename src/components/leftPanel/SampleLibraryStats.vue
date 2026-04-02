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
import { ref, onMounted, computed, watch } from 'vue'
import baseImage from '../../assets/left/底座2.png'

const props = defineProps({
  sampleSet: {
    type: Array,
    default: () => []
  },
  sampleCount: {
    type: Number,
    default: 0
  }
})

const tags = ref([])
const displayedTags = ref([])

onMounted(async () => {
  if (Array.isArray(props.sampleSet) && props.sampleSet.length) {
    tags.value = [...props.sampleSet]
    displayedTags.value = [...tags.value]
    return
  }
  try {
    const response = await fetch('/tags.json')
    tags.value = await response.json()
    displayedTags.value = [...tags.value]
  } catch (e) {
    tags.value = []
    displayedTags.value = []
  }
})

watch(() => props.sampleSet, (val) => {
  if (Array.isArray(val) && val.length) {
    tags.value = [...val]
    displayedTags.value = [...val]
  }
}, { deep: true })

// 获取词条样式 - 根据151px容器高度精确调整位置
function getTagStyle(index) {
  const rows = 3
  const row = index % rows
  
  // 容器高度151px，弹幕高度24px，3行分布
  // 计算垂直间距，确保弹幕在容器内均匀分布
  const containerHeight = 151
  const tagHeight = 24
  const totalTagHeight = rows * tagHeight
  const availableSpace = containerHeight - totalTagHeight
  const padding = availableSpace / (rows + 1) // 上下各留padding，中间均匀分布
  
  // 计算每行的top位置
  const baseTop = padding + row * (tagHeight + padding)
  
  // 延迟时间调整，避免弹幕过于密集
  const baseDelay = index * 1.2
  
  return {
    top: `${Math.round(baseTop)}px`,
    animationDelay: `${baseDelay}s`,
    animationDuration: `${18 + Math.random() * 7}s`
  }
}
</script>

<style scoped>
.sample-library-stats {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: left;
  width: 388px;
  margin-bottom: 30px;
}

/* 标题栏 */
.title-bar {
  width: 388px;
  height: 32px;
  padding: 0 16px;
  background: linear-gradient(90deg, #42ACFF 0%, rgba(211,235,255,0) 100%);
  text-align: left;
  /* margin-bottom: 8px; */
  margin-bottom: 0;
  display: flex;
  align-items: center;
  /* outline: 2px solid red; */
  margin-bottom: 25px;
}

.title-text {
  font-size: 18px;
  font-family: SourceHanSansCN, SourceHanSansCN;
  font-weight: 500;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.title-count {
  margin-left: auto;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

/* 弹幕容器 */
.danmaku-container {
  position: relative;
  width: 90%;
  height: 151px;
  /* height: 100%; */
  overflow: hidden;
  /* margin-bottom: 8px; */
  margin-bottom: 0;
  z-index: 1;
}

/* 弹幕词条 */
.danmaku-tag {
  position: absolute;
  left: 100%;
  right: auto;
  /* 高度 24px，左右内边距用于适配不同文字长度 */
  height: 24px;
  padding: 2px 12px;
  /* 右实左虚：右侧不透明，向左逐渐透明，只保留右侧圆角 */
  background: linear-gradient(270deg, #E2F3FF 0%, rgba(226, 243, 255, 0) 100%);
  border-radius: 0 12px 12px 0;
  /* 用伪元素做渐变描边，避免 border-image 导致圆角失效 */
  border: 0;
  overflow: hidden;
  isolation: isolate;
  font-size: 14px;
  color: #3F73B1;
  white-space: nowrap;
  animation: danmakuMove linear infinite;
  font-weight: 500;
}

.danmaku-tag::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px; /* 描边粗细 */
  background: linear-gradient(270deg, rgba(93, 176, 255, 1) 0%, rgba(210, 234, 252, 0) 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  pointer-events: none;
  z-index: -1;
}

@keyframes danmakuMove {
  0% {
    left: 100%;
  }
  100% {
    left: calc(-100% - 10px);
  }
}

/* 底座图片 */
.base-image {
  width: 90%;
  height: 60px;
  object-fit: contain;
}
</style>

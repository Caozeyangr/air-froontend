<template>
  <div class="flip-counter">
    <div class="digit-group">
      <FlipDigit 
        v-for="(digit, index) in displayDigits" 
        :key="index" 
        :digit="digit"
        :delay="index * 200"
        :is-animating="isAnimating"
      />
    </div>
    <span class="suffix">{{ suffix }}</span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import FlipDigit from './FlipDigit.vue'

const props = defineProps({
  value: {
    type: Number,
    default: 100
  },
  suffix: {
    type: String,
    default: '万+'
  },
  duration: {
    type: Number,
    default: 5000 // 5秒
  }
})

const currentValue = ref(0)
const isAnimating = ref(false)

const displayDigits = computed(() => {
  return currentValue.value.toString().split('').map(Number)
})

onMounted(() => {
  animateValue()
})

// 从0开始，每5秒增长10
function animateValue() {
  isAnimating.value = true
  currentValue.value = 0
  
  const step = 10      // 每次增长10
  const interval = 5000 // 每5秒增长一次
  const maxValue = 200  // 最大增长到200
  
  const grow = () => {
    const targetValue = Math.min(currentValue.value + step, maxValue)
    
    animateToTarget(currentValue.value, targetValue, 1000, () => {
      if (currentValue.value < maxValue) {
        setTimeout(grow, interval - 1000) // 减去动画时间
      } else {
        isAnimating.value = false
      }
    })
  }
  
  // 延迟后开始第一次增长
  setTimeout(grow, interval)
}

// 动画到目标值
function animateToTarget(startValue, endValue, duration, onComplete) {
  const startTime = Date.now()
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // 使用 easeOutQuart 缓动函数
    const easeProgress = 1 - Math.pow(1 - progress, 4)
    currentValue.value = Math.floor(startValue + (endValue - startValue) * easeProgress)
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      currentValue.value = endValue
      if (onComplete) onComplete()
    }
  }
  
  requestAnimationFrame(animate)
}

// 暴露方法供外部调用
defineExpose({
  animateValue
})
</script>

<style scoped>
.flip-counter {
  display: flex;
  align-items: center;
  gap: 4px;
}

.digit-group {
  display: flex;
  gap: 0;
}

.suffix {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  font-family: 'DIN Alternate', 'Arial', sans-serif;
}
</style>

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
import { ref, computed, watch ,onMounted} from 'vue'
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
  },
  step: {
    type: Number,
    default: 10
  }
})

const currentValue = ref(0)
const isAnimating = ref(false)

const displayDigits = computed(() => {
  return currentValue.value.toString().split('').map(Number)
})

// 监听props.value的变化，当value变化时执行动画
watch(() => props.value, (newValue) => {
  if (newValue !== undefined && newValue !== null && newValue > 0) {
    animateValue()
  }
}, { immediate: false })

// 数值更新系统：从0开始，每5秒增长10，直到达到目标值
function animateValue() {
  isAnimating.value = true
  currentValue.value = 0
  
  const step = props.step           // 每次增长10
  const interval = 1000     // 每5秒增长一次
  const targetValue = props.value  // 使用传入的value作为最终目标值
  console.log(targetValue,'targetValue')
  const grow = () => {
    const nextValue = Math.min(currentValue.value + step, targetValue)
    
    animateToTarget(currentValue.value, nextValue, 1000, () => {
      if (currentValue.value < targetValue) {
        setTimeout(grow, interval - 1000) // 减去动画时间，确保总间隔为5秒
      } else {
        isAnimating.value = false
      }
    })
  }
  
  // 开始第一次增长
  grow()
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

<template>
  <div class="flip-digit">
    <div class="digit-inner" :class="{ 'flipping': isFlipping }">
      <div class="digit-front">{{ displayDigit }}</div>
      <div class="digit-back">{{ displayDigit }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  digit: {
    type: Number,
    required: true
  },
  delay: {
    type: Number,
    default: 0
  },
  isAnimating: {
    type: Boolean,
    default: false
  }
})

const displayDigit = ref(0)
const isFlipping = ref(false)

// 监听数字变化，触发翻转动画
watch(() => props.digit, (newDigit, oldDigit) => {
  if (newDigit !== oldDigit) {
    triggerFlip(newDigit)
  }
})

onMounted(() => {
  // 初始延迟后显示第一个数字
  setTimeout(() => {
    displayDigit.value = props.digit
    isFlipping.value = true
  }, props.delay)
})

function triggerFlip(newDigit) {
  isFlipping.value = false
  // 短暂延迟后更新数字并触发翻转
  setTimeout(() => {
    displayDigit.value = newDigit
    isFlipping.value = true
  }, 50)
}
</script>

<style scoped>
.flip-digit {
  width: 18px;
  height: 40px;
  perspective: 400px;
}

.digit-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.digit-inner.flipping {
  animation: flipDown 0.6s ease-out forwards;
}

.digit-front,
.digit-back {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  color: #1890ff;
  font-family: 'DIN Alternate', 'Arial', sans-serif;
  text-shadow: 0 2px 4px rgba(24, 144, 255, 0.3);
  background: transparent;
  border: none;
  backface-visibility: hidden;
}

.digit-front {
  transform: rotateX(0deg);
  z-index: 2;
}

.digit-back {
  transform: rotateX(-180deg);
  z-index: 1;
}

@keyframes flipDown {
  0% {
    transform: rotateX(0deg);
  }
  100% {
    transform: rotateX(-360deg);
  }
}
</style>

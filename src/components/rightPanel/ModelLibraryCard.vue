<template>
  <div class="model-library-card">
    <!-- 内容卡片 -->
    <div class="card-content">
      <div class="text-module">
        <div class="number-row">
          <FlipCounter :value="modelCountDisplay" :step="10" suffix="+" />
          <img :src="arrowImage" alt="上升" class="arrow-icon" />
        </div>
        <span class="label">航空智能化精细解译模型库</span>
      </div>
      <img :src="modelImage" alt="模型库" class="model-image" />
    </div>
  </div>
</template>

<script setup>
import FlipCounter from '../common/FlipCounter.vue'
import modelImage from '../../assets/right/航空智能化精细解译模型库.png'
import arrowImage from '../../assets/left/上箭头.png'
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
const props = defineProps({
  modelCount: {
    type: Number,
    default: 0
  }
})
const modelCountDisplay = computed(() => Number(props.modelCount || 0))
</script>

<style scoped>
.model-library-card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 425px;
  height: 115px;
  margin-bottom: 38px;
}

.card-content {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  display: block;
  padding: 0;
  background: transparent;
  overflow: hidden;
}

.text-module {
  position: absolute;
  left: 30px; /* 距离画面左侧约 1/10 */
  top: 42%;  /* 位于中下部，避免贴顶/贴底 */
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: end;
  justify-content: center;
  gap: 6px;
  z-index: 2;
}

.number-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.arrow-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.label {
  font-size: 20px;
  color: #2E4F72;
  font-weight: 400;
  font-family: PingFangSC, PingFang SC;
}

.model-image {
  position: absolute;
  left: 0; /* 与左侧文字模块左边缘对齐 */
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
</style>

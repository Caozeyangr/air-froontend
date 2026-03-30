<template>
  <div class="model-library-card">
    <!-- 内容卡片 -->
    <div class="card-content">
      <div class="info-section">
        <div class="number-row">
          <FlipCounter :value="28" suffix="+" />
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
</script>

<style scoped>
.model-library-card {
  display: flex;
  flex-direction: column;
}

/* 内容卡片 */
.card-content {
  width: 388px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: linear-gradient(90deg, rgba(66, 172, 255, 0.15) 0%, rgba(66, 172, 255, 0.05) 100%);
  border: 1px dashed rgba(66, 172, 255, 0.4);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

/* 底部装饰线 */
.card-content::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #42ACFF 0%, transparent 100%);
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1;
}

.number-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.arrow-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

.model-image {
  width: 120px;
  height: 100px;
  object-fit: contain;
  z-index: 1;
}
</style>

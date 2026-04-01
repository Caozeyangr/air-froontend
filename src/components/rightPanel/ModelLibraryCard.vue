<template>
  <div class="model-library-card">
    <!-- 内容卡片 -->
    <div class="card-content">
      <div class="text-module">
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
  position: relative;
  display: flex;
  flex-direction: column;
  width: 388px;
  height: 120px;
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
  left: 10%; /* 距离画面左侧约 1/10 */
  top: 42%;  /* 位于中下部，避免贴顶/贴底 */
  transform: translateY(-50%);
  width: 52%; /* 不越过画面中线，避免遮挡右图 */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
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
  font-size: 14px;
  color: #2e4f72;
  font-weight: 500;
  line-height: 20px;
  white-space: nowrap;
  text-align: left;
}

.model-image {
  position: absolute;
  left: 10%; /* 与左侧文字模块左边缘对齐 */
  top: -18px;
  width: 280px;
  height: 156px;
  object-fit: contain;
  z-index: 1;
}
</style>

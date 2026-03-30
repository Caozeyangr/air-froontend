<template>
  <div class="sample-library-card">
    <!-- 底座图片 -->
    <img 
      :src="baseImage" 
      alt="智能解译样本库底座" 
      class="base-image"
    />
    
    <!-- 数据展示区 -->
    <div class="data-display">
      <div class="number-row">
        <FlipCounter :value="100" suffix="万+" />
        <img 
          :src="arrowImage" 
          alt="上升箭头" 
          class="arrow-image"
        />
      </div>
      <div class="label">智能解译样本库</div>
    </div>
  </div>
</template>

<script setup>
import FlipCounter from '../common/FlipCounter.vue'
import baseImage from '../../assets/left/智能解译样本库底座.png'
import arrowImage from '../../assets/left/上箭头.png'
</script>

<style scoped>
.sample-library-card {
  position: relative;
  width: 280px;
  height: 120px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
}

.base-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 1;
}

.data-display {
  position: relative;
  z-index: 2;
  margin-left: 100px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.number-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.arrow-image {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}
</style>

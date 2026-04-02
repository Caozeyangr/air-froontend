<template>
  <div class="sample-library-card">
    <!-- 底座图片 -->
    <img :src="baseImage" alt="智能解译样本库底座" class="base-image" />

    <!-- 数据展示区 -->
    <div class="data-display">
      <div class="number-row">
        <FlipCounter :value="sampleCountDisplay"  :step="10" suffix="万+" />
        <img :src="arrowImage" alt="上升箭头" class="arrow-image" />
      </div>
      <div class="label">智能解译样本库</div>
    </div>
  </div>
</template>

<script setup>
import FlipCounter from '../common/FlipCounter.vue'
import baseImage from '../../assets/left/智能解译样本库底座.png'
import arrowImage from '../../assets/left/上箭头.png'
import { onMounted, computed, ref } from 'vue';
const props = defineProps({
  sampleCount: {
    type: Number,
    default: 0
  }
})
const sampleCountDisplay = computed(() => {
  const count = Number(props.sampleCount || 0)
  return Math.round(count / 10000)  // 换算为以万为单位并取整数
})

onMounted(() => {
})
</script>

<style scoped>
.sample-library-card {
  position: relative;
  width: 425px;
  height: 106px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  margin-bottom: 39px;
}

.base-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.data-display {
  position: absolute;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 4px;
  top: 0px;
  left: 174px;
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
  font-size: 20px;
  color: #2E4F72;
  font-weight: 400;
  font-family: PingFangSC, PingFang SC;
}
</style>

<template>
  <div class="hardware-stats">
    <!-- 标题栏 -->
    <div class="title-bar">
      <span class="title-text">硬件资源统计</span>
    </div>
    
    <!-- 4个统计卡片 -->
    <div class="stats-grid">
      <div 
        v-for="item in statsData" 
        :key="item.label"
        class="stat-card"
      >
        <!-- 用 icon png 作为“整张卡片背景”铺满 -->
        <img :src="item.icon" alt="" class="stat-bg" />
        <div class="stat-info">
          <span class="stat-label">{{ item.label }}</span>
          <div class="stat-value">
            <span class="stat-number">{{ item.value }}</span>
            <span class="stat-unit">{{ item.unit }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import machineIcon from '../../assets/left/机器数量.png'
import gpuIcon from '../../assets/left/GPU显卡数量.png'
import memoryIcon from '../../assets/left/内存总量.png'
import cpuIcon from '../../assets/left/CPU核心.png'

const statsData = [
  { label: '机器数量', value: 3, unit: '台', icon: machineIcon },
  { label: '显卡数量', value: 24, unit: '张', icon: gpuIcon },
  { label: '内存总量', value: 3, unit: 'TB', icon: memoryIcon },
  { label: 'CPU核心', value: 576, unit: '', icon: cpuIcon },
]
</script>

<style scoped>
.hardware-stats {
  display: flex;
  flex-direction: column;
}

/* 标题栏 - 与智能解译样本库统计保持一致 */
.title-bar {
  display: none;
  width: 388px;
  height: 32px;
  padding: 0 16px;
  background: linear-gradient(90deg, #42ACFF 0%, rgba(211, 235, 255, 0) 100%);
  text-align: left;
  margin-bottom: 12px;
  /* display: flex; */
  align-items: center;
}

.title-text {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* 4格网格布局 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 388px;
}

/* 统计卡片 */
.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(66, 172, 255, 0.06);
  border: 1px solid rgba(66, 172, 255, 0.22); /* 去掉虚线边框 */
  border-radius: 2px;
  box-sizing: border-box;
  overflow: hidden; /* 裁剪背景铺满时的圆角 */
}

.stat-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill; /* “铺满”要求拉伸充满整个卡片框 */
  z-index: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  position: relative;
  z-index: 1;
  /* 图标在背景左侧，给文字留出原来图标宽度+间距位置 */
  padding-left: 87px;
}

.stat-label {
  width: 56px;
  height: 20px;
  font-family: SourceHanSansCN, SourceHanSansCN;
  font-weight: 400;
  font-size: 14px;
  color: #3F73B1;
  line-height: 20px;
  text-align: left;
  font-style: normal;
  white-space: nowrap;
}

.stat-value {
  display: flex;
  align-items: flex-start;
  gap: 2px;
  height: 28px; /* 对齐下面数字的高度 */
}

.stat-number {
  height: 28px;
  font-family: PingFangSC, PingFang SC;
  font-weight: 500;
  font-size: 20px;
  color: #269EF5;
  line-height: 28px;
  text-align: left;
  font-style: normal;
}

.stat-unit {
  font-family: PingFangSC, PingFang SC;
  font-weight: 500;
  font-size: 20px;
  color: #269EF5;
  line-height: 28px;
  font-style: normal;
}
</style>

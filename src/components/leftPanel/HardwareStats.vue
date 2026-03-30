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
        <img :src="item.icon" :alt="item.label" class="stat-icon" />
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
  width: 388px;
  height: 32px;
  padding: 0 16px;
  background: linear-gradient(90deg, #42ACFF 0%, rgba(211, 235, 255, 0) 100%);
  text-align: left;
  margin-bottom: 12px;
  display: flex;
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
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(66, 172, 255, 0.1);
  border: 1px dashed rgba(66, 172, 255, 0.3);
  border-radius: 4px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 14px;
  color: #C0E8FF;
}

.stat-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #42ACFF;
  line-height: 1;
}

.stat-unit {
  font-size: 14px;
  color: #42ACFF;
}
</style>

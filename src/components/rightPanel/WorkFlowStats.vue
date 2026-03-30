<template>
  <div class="workflow-stats">
    <!-- 标题栏 -->
    <div class="title-bar">
      <span class="title-text">工作流统计</span>
    </div>

    <div class="content-wrapper">
      <!-- 3D饼图 -->
      <div ref="chartRef" class="chart-container"></div>

      <!-- 统计列表 -->
      <div class="stats-list">
        <div v-for="(item, index) in workflowData" :key="index" class="stats-item">
          <div class="stats-indicator" :style="{ background: item.color }"></div>
          <span class="stats-name">{{ item.name }}</span>
          <span class="stats-value" :style="{ color: item.color }">{{ item.value }}类</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import 'echarts-gl'

const chartRef = ref(null)
let chart = null

const workflowData = [
  { name: '智能解译工作流', value: 7, color: '#42ACFF' },
  { name: '生态评估工作流', value: 3, color: '#52C41A' },
  { name: '应急监测工作流', value: 3, color: '#36CFC9' },
  { name: '其他分类工作流', value: 5, color: '#FAAD14' }
]

// 获取3D饼图数据 - 生成顶面、底面和侧面（带厚度）
function getPie3D(pieData) {
  const series = []
  let sumValue = 0
  let startValue = 0
  let endValue = 0

  for (let i = 0; i < pieData.length; i++) {
    sumValue += pieData[i].value
  }

  const thickness = 0.25
  const innerRadius = 0.35

  for (let i = 0; i < pieData.length; i++) {
    const item = pieData[i]
    endValue = startValue + item.value
    const startRatio = startValue / sumValue
    const endRatio = endValue / sumValue
    const startRadian = startRatio * Math.PI * 2
    const endRadian = endRatio * Math.PI * 2

    // 1. 顶面
    series.push({
      name: item.name,
      type: 'surface',
      parametric: true,
      wireframe: { show: false },
      itemStyle: {
        color: item.itemStyle.color,
        opacity: 1
      },
      parametricEquation: {
        u: { min: startRadian, max: endRadian, step: (endRadian - startRadian) / 40 },
        v: { min: innerRadius, max: 1, step: (1 - innerRadius) / 10 },
        x: function (u, v) { return Math.cos(u) * v },
        y: function (u, v) { return Math.sin(u) * v },
        z: function (u, v) { return thickness }
      }
    })

    // 2. 底面
    series.push({
      name: item.name + '_bottom',
      type: 'surface',
      parametric: true,
      wireframe: { show: false },
      itemStyle: {
        color: item.itemStyle.color,
        opacity: 1
      },
      parametricEquation: {
        u: { min: startRadian, max: endRadian, step: (endRadian - startRadian) / 40 },
        v: { min: innerRadius, max: 1, step: (1 - innerRadius) / 10 },
        x: function (u, v) { return Math.cos(u) * v },
        y: function (u, v) { return Math.sin(u) * v },
        z: function (u, v) { return 0 }
      }
    })

    // 3. 外侧面
    series.push({
      name: item.name + '_outer',
      type: 'surface',
      parametric: true,
      wireframe: { show: false },
      itemStyle: {
        color: item.itemStyle.color,
        opacity: 0.9
      },
      parametricEquation: {
        u: { min: startRadian, max: endRadian, step: (endRadian - startRadian) / 40 },
        v: { min: 0, max: thickness, step: thickness / 8 },
        x: function (u, v) { return Math.cos(u) },
        y: function (u, v) { return Math.sin(u) },
        z: function (u, v) { return v }
      }
    })

    // 4. 内侧面
    series.push({
      name: item.name + '_inner',
      type: 'surface',
      parametric: true,
      wireframe: { show: false },
      itemStyle: {
        color: item.itemStyle.color,
        opacity: 0.8
      },
      parametricEquation: {
        u: { min: startRadian, max: endRadian, step: (endRadian - startRadian) / 40 },
        v: { min: 0, max: thickness, step: thickness / 8 },
        x: function (u, v) { return Math.cos(u) * innerRadius },
        y: function (u, v) { return Math.sin(u) * innerRadius },
        z: function (u, v) { return v }
      }
    })

    // 5. 起始侧面
    series.push({
      name: item.name + '_start',
      type: 'surface',
      parametric: true,
      wireframe: { show: false },
      itemStyle: {
        color: item.itemStyle.color,
        opacity: 0.95
      },
      parametricEquation: {
        u: { min: innerRadius, max: 1, step: (1 - innerRadius) / 10 },
        v: { min: 0, max: thickness, step: thickness / 8 },
        x: function (u, v) { return Math.cos(startRadian) * u },
        y: function (u, v) { return Math.sin(startRadian) * u },
        z: function (u, v) { return v }
      }
    })

    // 6. 结束侧面
    series.push({
      name: item.name + '_end',
      type: 'surface',
      parametric: true,
      wireframe: { show: false },
      itemStyle: {
        color: item.itemStyle.color,
        opacity: 0.95
      },
      parametricEquation: {
        u: { min: innerRadius, max: 1, step: (1 - innerRadius) / 10 },
        v: { min: 0, max: thickness, step: thickness / 8 },
        x: function (u, v) { return Math.cos(endRadian) * u },
        y: function (u, v) { return Math.sin(endRadian) * u },
        z: function (u, v) { return v }
      }
    })

    startValue = endValue
  }

  return series
}

function initChart() {
  chart = echarts.init(chartRef.value)

  const pieData = workflowData.map(item => ({
    value: item.value,
    name: item.name,
    itemStyle: { color: item.color }
  }))

  const series = getPie3D(pieData)

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      show: true,
      formatter: (params) => {
        if (params.seriesName && !params.seriesName.includes('_')) {
          return `${params.seriesName}<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params.color};"></span>${workflowData.find(item => item.name === params.seriesName)?.value}类`
        }
      }
    },
    xAxis3D: {
      min: -1,
      max: 1
    },
    yAxis3D: {
      min: -1,
      max: 1
    },
    zAxis3D: {
      min: -1,
      max: 1
    },
    grid3D: {
      show: false,
      boxHeight: 20,
      viewControl: {
        alpha: 35,
        beta: 30,
        distance: 220,
        autoRotate: true,
        autoRotateSpeed: 8
      }
    },
    series: series
  }

  chart.setOption(option)
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chart && chart.resize())
})

onBeforeUnmount(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
  window.removeEventListener('resize', () => chart && chart.resize())
})
</script>

<style scoped>
.workflow-stats {
  display: flex;
  flex-direction: column;
  width: 388px;
}

/* 标题栏 */
.title-bar {
  width: 100%;
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

/* 内容区域 */
.content-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  padding: 0 8px;
}

/* 图表容器 */
.chart-container {
  width: 160px;
  height: 160px;
  flex-shrink: 0;
}

/* 统计列表 */
.stats-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-indicator {
  width: 3px;
  height: 14px;
  border-radius: 2px;
}

.stats-name {
  font-size: 14px;
  color: #C0E8FF;
  flex: 1;
}

.stats-value {
  font-size: 16px;
  font-weight: bold;
}
</style>

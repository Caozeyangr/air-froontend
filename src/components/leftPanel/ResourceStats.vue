<template>
  <div class="resource-stats">
    <!-- 标题栏 -->
    <div class="title-bar">
      <span class="title-text">资源统计</span>
    </div>
    <!-- ECharts 图表区域 -->
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref(null)
let chart = null

const data = [
  { name: 'GPU显卡负载率', value: 80 },
  { name: 'CPU负载率', value: 70 },
  { name: '内存负载率', value: 60 },
]

function initChart() {
  chart = echarts.init(chartRef.value, null, { renderer: 'canvas' })

  const option = {
    backgroundColor: 'transparent',
    grid: {
      top: 16,
      bottom: 8,
      left: 0,
      right: 60,
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      max: 100,
      show: false,
    },
    yAxis: {
      type: 'category',
      data: data.map(d => d.name).reverse(),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#C0E8FF',
        fontSize: 13,
        margin: 12,
      },
    },
    series: [
      // 背景条（灰色轨道）
      {
        type: 'bar',
        data: data.map(() => 100).reverse(),
        barWidth: 6,
        barGap: '-100%',
        itemStyle: {
          color: 'rgba(255,255,255,0.1)',
          borderRadius: 3,
        },
        z: 1,
        silent: true,
      },
      // 渐变进度条
      {
        type: 'bar',
        data: data.map((d, i) => ({
          value: d.value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#42ACFF' },
              { offset: 1, color: i === 0 ? '#A855F7' : i === 1 ? '#60A5FA' : '#22D3EE' },
            ]),
            borderRadius: 3,
          },
        })).reverse(),
        barWidth: 6,
        z: 2,
        label: {
          show: true,
          position: 'right',
          formatter: params => {
            const idx = data.length - 1 - params.dataIndex
            return `{val|${data[idx].value}}{unit|%}`
          },
          rich: {
            val: {
              color: '#42ACFF',
              fontSize: 16,
              fontWeight: 'bold',
            },
            unit: {
              color: '#42ACFF',
              fontSize: 12,
            },
          },
          distance: 8,
        },
      },
    ],
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
.resource-stats {
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
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.title-text {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.chart-container {
  width: 388px;
  height: 140px;
}
</style>

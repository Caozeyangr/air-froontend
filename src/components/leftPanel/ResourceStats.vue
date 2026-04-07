<template>
  <div class="resource-stats">
    <div class="title-bar">
      <span class="title-text">资源统计</span>
    </div>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  gpu: { type: Number, default: 0 },
  cpu: { type: Number, default: 0 },
  memory: { type: Number, default: 0 }
})

function clampPct(n) {
  const v = Number(n)
  if (Number.isNaN(v)) return 0
  const clamped = Math.min(100, Math.max(0, v))
  return Number(clamped.toFixed(2))
}

const chartRef = ref(null)
let chart = null

/** 与 getResourceMetrics 返回的 gpu / cpu / memory（负载率）对应 */
const data = computed(() => [
  { name: 'GPU显卡负载率', value: clampPct(props.gpu), endColor: '#A855F7' },
  { name: 'CPU负载率', value: clampPct(props.cpu), endColor: '#42ACFF' },
  { name: '内存负载率', value: clampPct(props.memory), endColor: '#42ACFF' }
])

function buildOption() {
  const rows = data.value
  const categories = rows.map(d => d.name)

  return {
    backgroundColor: 'transparent',
    grid: {
      // 进度条在中间，两侧文字/百分比固定在“进度条正上方”
      top: 12,
      bottom: 12,
      left: 10,
      right: 10,
      containLabel: false,
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: 100,
      show: false,
    },
    yAxis: {
      type: 'category',
      data: categories,
      inverse: true, // GPU在最上方
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
    },
    series: [
      // 1. 背景轨道（底层淡色条）
      {
        type: 'bar',
        data: rows.map(() => ({ value: 100 })),
        itemStyle: {
          color: (params) => {
            const colors = ['rgba(168,85,247,0.15)', 'rgba(66,172,255,0.15)', 'rgba(34,211,238,0.15)']
            return colors[params.dataIndex]
          },
          borderRadius: 2,
        },
        barWidth: 4,
        barGap: '-100%',
        z: 1,
        silent: true,
      },

      // 2. 渐变进度条（中间主视觉）
      {
        type: 'bar',
        data: rows.map((item) => ({
          value: item.value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#22D3EE' },
              { offset: 0.5, color: '#42ACFF' },
              { offset: 1, color: item.endColor },
            ]),
            borderRadius: 2,
          },
        })),
        barWidth: 4,
        barGap: '-100%',
        z: 2,
        label: { show: false }, // 关闭进度条自带label，避免错位
      },

      // 3. 右侧百分比：固定在容器最右侧，右对齐，位置完全统一
      {
        type: 'scatter',
        symbolSize: 0, // 隐藏圆点，只显示文字
        data: rows.map((_, i) => [100, i]),
        label: {
          show: true,
          formatter: (p) => `{val|${rows[p.dataIndex].value.toFixed(2)}}{unit|%}`,
          position: 'top',
          offset: [0, -9],
          align: 'right',
          verticalAlign: 'bottom',
          rich: {
            val: {
              color: '#42ACFF',
              fontSize: 16,
              fontWeight: 'bold',
              align: 'right',
              verticalAlign: 'bottom',
            },
            unit: {
              color: '#42ACFF',
              fontSize: 12,
              fontWeight: 'bold',
              align: 'left',
              verticalAlign: 'bottom',
              padding: [0, 0, 0, 1],
            },
          },
        },
        tooltip: { show: false },
        z: 10,
      },

      // 4. 左侧文字：左对齐，位于进度线正上方（与右侧同高）
      {
        type: 'scatter',
        symbolSize: 0,
        data: rows.map((_, i) => [0, i]),
        label: {
          show: true,
          formatter: (p) => categories[p.dataIndex],
          position: 'top',
          offset: [0, -9],
          align: 'left',
          verticalAlign: 'bottom',
          color: '#3F73B1',
          fontSize: 14,
          fontWeight: 500,
        },
        tooltip: { show: false },
        z: 10,
      },
    ],
  }
}

function initChart() {
  if (!chartRef.value) return
  if (!chart) {
    chart = echarts.init(chartRef.value, null, { renderer: 'canvas' })
  }
  chart.setOption(buildOption(), true)
}

function resizeChart() {
  chart?.resize()
}

watch(data, () => {
  initChart()
}, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  chart?.dispose()
})
</script>

<style scoped>
.resource-stats {
  display: flex;
  flex-direction: column;
}
.title-bar {
  width: 388px;
  height: 32px;
  padding: 0 16px;
  background: linear-gradient(90deg, #42ACFF 0%, rgba(211,235,255,0) 100%);
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  margin-bottom: 25px;
}
.title-text {
  font-size: 18px;
  font-family: SourceHanSansCN, SourceHanSansCN;
  font-weight: 500;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
.chart-container {
  width: 388px;
  height: 130px;
}
</style>
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
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import * as echarts from 'echarts'
import 'echarts-gl'

const chartRef = ref(null)
let chart = null
let resizeHandler = null

const props = defineProps({
  workflowList: {
    type: Array,
    default: () => []
  }
})

const defaultWorkflowData = [
  { name: '智能解译工作流', value: 7, color: '#42ACFF' },
  { name: '生态评估工作流', value: 3, color: '#52C41A' },
  { name: '应急监测工作流', value: 3, color: '#36CFC9' },
  { name: '其他分类工作流', value: 5, color: '#FAAD14' }
]

const colorMap = {
  智能解译工作流: '#42ACFF',
  生态评估工作流: '#52C41A',
  应急监测工作流: '#36CFC9',
  其他分类工作流: '#FAAD14'
}

const workflowData = computed(() => {
  if (!Array.isArray(props.workflowList) || !props.workflowList.length) return defaultWorkflowData
  return props.workflowList.map((item, idx) => ({
    name: item?.name || `工作流${idx + 1}`,
    value: Number(item?.num ?? 0),
    color: colorMap[item?.name] || defaultWorkflowData[idx % defaultWorkflowData.length].color
  }))
})

function hexToRgb(hex) {
  const h = String(hex || '').replace('#', '').trim()
  if (h.length !== 6) return { r: 66, g: 172, b: 255 }
  const n = parseInt(h, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function mixRgb(a, b, t) {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t)
  }
}

function rgbToCss({ r, g, b }, alpha = 1) {
  return `rgba(${r},${g},${b},${alpha})`
}

function initChart() {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)

  const data = workflowData.value
  const total = data.reduce((prev, curr) => prev + Number(curr.value || 0), 0)

  // 扇形渐变：跟右侧文字颜色一致（用该颜色做由亮到深的线性渐变）
  const pieData = data.map((d) => {
    const base = hexToRgb(d.color)
    const lighter = mixRgb(base, { r: 255, g: 255, b: 255 }, 0.55)
    const darker = mixRgb(base, { r: 0, g: 0, b: 0 }, 0.12)
    return {
      name: d.name,
      // 仅调整图形半径观感（roseType: area）：
      // - 青色缩到原绿色半径
      // - 绿色再缩小到中层蓝圈内，并与蓝圈留出间距
      value:
        d.color === '#36CFC9'
          ? Number(d.value || 0) * 0.72
          : d.color === '#52C41A'
            ? Number(d.value || 0) * 0.30
            : Number(d.value || 0),
      rawValue: Number(d.value || 0),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: rgbToCss(lighter, 1) },
          { offset: 1, color: rgbToCss(darker, 1) }
        ])
      }
    }
  })

  const option = {
    backgroundColor: 'transparent',
    color: ['#FFD632', '#68A2F8', '#2778FF', '#1ED6C1'],
    tooltip: {
      show: true,
      trigger: 'item',
      borderColor: 'rgba(255,255,255,.3)',
      backgroundColor: 'rgba(13,5,30,.6)',
      borderWidth: 1,
      formatter: (params) => {
        if (!params?.data?.name) return ''
        const realValue = Number(params.data.rawValue ?? params.data.value ?? 0)
        const percent = total ? Math.round((realValue / total) * 100) : 0
        return `${params.marker}${params.data.name}<br/>占比：${percent}%`
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['0%', '0%'],
        center: ['50%', '50%'],
        hoverAnimation: false,
        silent: true,
        label: { show: false },
        labelLine: { show: false },
        data: [{ name: '', value: 0, itemStyle: { color: '#5EA7FE' } }]
      },
      // 最中心蓝色细圈（你说的中间那一圈）
      {
        type: 'pie',
        radius: ['22%', '23.2%'],
        center: ['50%', '50%'],
        hoverAnimation: false,
        silent: true,
        zlevel: 12,
        label: { show: false },
        labelLine: { show: false },
        data: [{ name: '', value: 1, itemStyle: { color: '#5EA7FE' } }]
      },
      {
        type: 'pie',
        radius: ['90%', '95%'],
        center: ['50%', '50%'],
        hoverAnimation: false,
        silent: true,
        label: { show: false },
        labelLine: { show: false },
        data: [{ name: '', value: 0, itemStyle: { color: '#5EA7FE' } }]
      },
      // 扇形中间穿过的蓝色细环（示例图中的中层蓝圈）
      {
        type: 'pie',
        radius: ['54.5%', '55.5%'],
        center: ['50%', '50%'],
        hoverAnimation: false,
        silent: true,
        // 放在扇形下层：蓝/青扇形覆盖该圈，绿色因半径更小会在其外侧露出蓝圈
        zlevel: 9,
        label: { show: false },
        labelLine: { show: false },
        data: [{ name: '', value: 1, itemStyle: { color: '#5EA7FE' } }]
      },
      // 蓝色扇形外再加一圈蓝色圆环（细圈）
      {
        type: 'pie',
        radius: ['72.5%', '73.5%'],
        center: ['50%', '50%'],
        hoverAnimation: false,
        silent: true,
        zlevel: 9,
        label: { show: false },
        labelLine: { show: false },
        data: [{ name: '', value: 1, itemStyle: { color: '#5EA7FE' } }]
      },
      {
        stack: 'a',
        type: 'pie',
        radius: ['40%', '70%'],
        roseType: 'area',
        zlevel: 10,
        hoverAnimation: true,
        center: ['50%', '50%'],
        label: { show: false },
        labelLine: { show: false },
        data: pieData
      }
    ]
  }

  chart.setOption(option, true)
}

onMounted(() => {
  initChart()
  resizeHandler = () => chart && chart.resize()
  window.addEventListener('resize', resizeHandler)
})

watch(workflowData, () => {
  initChart()
}, { deep: true })

onBeforeUnmount(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }
})
</script>

<style scoped>
.workflow-stats {
  display: flex;
  flex-direction: column;
  width: 388px;
  margin-top: -6px; /* 整块上移，贴近设计稿间距 */
}

/* 标题栏 */
.title-bar {
  width: 100%;
  height: 32px;
  padding: 0 12px 0 16px;
  background: linear-gradient(270deg, #42ACFF 0%, rgba(211, 235, 255, 0) 100%);
  text-align: right;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.title-text {
   font-size: 18px;
  font-family: SourceHanSansCN, SourceHanSansCN;
  font-weight: 500;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* 内容区域 */
.content-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 14px;
  padding: 0 6px;
}

/* 图表容器 */
.chart-container {
  width: 152px;
  height: 152px;
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
  width: 175px;
  height: 26px;
  padding: 0 8px 0 8px;
  background: #DCEFFF;
  border-radius: 13px;
  box-sizing: border-box;
}

.stats-indicator {
  width: 3px;
  height: 14px;
  border-radius: 2px;
}

.stats-name {
  width: auto;
  height: 20px;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #3F73B1;
  line-height: 20px;
  text-align: left;
  font-style: normal;
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stats-value {
  min-width: 24px;
  height: 20px;
  margin-left: 4px;
  font-family: PingFangSC, PingFang SC;
  font-weight: 500; /* Medium */
  font-size: 14px;
  color: #00A3FA;
  line-height: 20px;
  text-align: right;
  font-style: normal;
  flex: 0 0 auto;
  white-space: nowrap;
}
</style>

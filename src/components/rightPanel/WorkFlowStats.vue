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

function initChart() {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)

  const data = workflowData.value
  // 仅用于视觉占比/角度，不影响右侧列表显示值
  const visualValues = data.map((d) => Math.max(1, Number(d.value || 0)))
  const gradients = [
    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: '#6FD3FF' },
      { offset: 1, color: '#208BFF' }
    ]),
    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: '#B5FFF4' },
      { offset: 1, color: '#1BC9B1' }
    ]),
    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: '#C6F6B0' },
      { offset: 1, color: '#52C41A' }
    ]),
    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: '#FFE9A6' },
      { offset: 1, color: '#FFB52C' }
    ])
  ]
  const makeSingleSliceSeries = (sliceIndex, outerRadius) => ({
    name: `workflow-main-${sliceIndex}`,
    type: 'pie',
    radius: ['24%', outerRadius],
    center: ['50%', '52%'],
    clockwise: true,
    startAngle: 220,
    avoidLabelOverlap: false,
    label: { show: false },
    labelLine: { show: false },
    itemStyle: {
      shadowColor: 'rgba(0, 0, 0, 0.15)',
      shadowBlur: 12,
      shadowOffsetY: 4
    },
    data: data.map((item, i) => ({
      name: item.name,
      value: visualValues[i],
      itemStyle: i === sliceIndex
        ? { color: gradients[i] }
        : { color: 'rgba(0,0,0,0)' }
    }))
  })

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      show: true,
      formatter: (params) => {
        if (params.seriesType === 'pie' && params.data && params.data.name) {
          const item = data.find(d => d.name === params.data.name)
          return `${params.data.name}<br/>
            <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params.color};"></span>
            ${item ? item.value : params.data.value}类`
        }
      }
    },
    series: [
      // 按扇区单独控制半径：黄色、绿色在圆内收缩（半径更小）
      makeSingleSliceSeries(0, '62%'), // 蓝色
      makeSingleSliceSeries(1, '62%'), // 青色
      makeSingleSliceSeries(2, '50%'), // 绿色（最小半径）
      makeSingleSliceSeries(3, '54%'), // 黄色（比绿色稍大）
      {
        // 中心蓝色小圈：空心，圈宽≈内空白半径
        name: 'center-ring',
        type: 'pie',
        radius: ['9%', '24%'],
        center: ['50%', '52%'],
        silent: true,
        z: 3,
        label: { show: false },
        labelLine: { show: false },
        data: [
          {
            value: 1,
            itemStyle: {
              color: new echarts.graphic.RadialGradient(0.5, 0.35, 0.7, [
                { offset: 0, color: '#FFFFFF' },
                { offset: 0.6, color: '#60CCFF' },
                { offset: 1, color: '#1E8BFF' }
              ])
            }
          }
        ]
      },
      // 蓝色扇区外扩一圈：让蓝色超出当前圆
      {
        name: 'workflow-blue-extend',
        type: 'pie',
        // 让蓝色区域明显超出外圈边框：外半径略大于 outer-ring 的 71%
        radius: ['62%', '78%'],
        center: ['50%', '52%'],
        clockwise: true,
        startAngle: 220,
        silent: true,
        z: 2,
        label: { show: false },
        labelLine: { show: false },
        data: [
          {
            name: '智能解译工作流',
            // 与主扇区相同的数值，保证角度一致
            value: visualValues[0],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(111, 211, 255, 0.9)' },
                { offset: 1, color: 'rgba(32, 139, 255, 0.9)' }
              ])
            }
          },
          {
            name: '生态评估工作流',
            value: visualValues[1],
            itemStyle: { color: 'rgba(0,0,0,0)' } // 角度保留，颜色完全透明
          },
          {
            name: '应急监测工作流',
            value: visualValues[2],
            itemStyle: { color: 'rgba(0,0,0,0)' }
          },
          {
            name: '其他分类工作流',
            value: visualValues[3],
            itemStyle: { color: 'rgba(0,0,0,0)' }
          }
        ]
      },
      {
        name: 'outer-ring',
        type: 'pie',
        radius: ['68%', '71%'],
        center: ['50%', '52%'],
        silent: true,
        z: 1,
        label: { show: false },
        labelLine: { show: false },
        data: [
          {
            value: 1,
            itemStyle: {
              color: 'rgba(74, 176, 255, 0.6)'
            }
          }
        ]
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

<template>
  <div class="model-library-stats">
    <!-- 标题栏 -->
    <div class="title-bar">
      <span class="title-text">航空智能化精细解译模型库统计</span>
    </div>

    <!-- 3D环形图 -->
    <div ref="chartRef" class="chart-container"></div>

    <!-- 分类标签 -->
    <div class="category-list">
      <div class="category-item">
        <div class="category-header">
          <span class="category-dot" style="background: #42ACFF;"></span>
          <span class="category-name">语义分割</span>
        </div>
        <div class="tag-list">
          <span v-for="tag in semanticTags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>

      <div class="category-item">
        <div class="category-header">
          <span class="category-dot" style="background: #52C41A;"></span>
          <span class="category-name">目标检测</span>
        </div>
        <div class="tag-list">
          <span v-for="tag in detectionTags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>

      <div class="category-item">
        <div class="category-header">
          <span class="category-dot" style="background: #FAAD14;"></span>
          <span class="category-name">参数反演</span>
        </div>
        <div class="tag-list">
          <span v-for="tag in inversionTags" :key="tag" class="tag">{{ tag }}</span>
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

const semanticTags = ['建筑物', '道路', '林地', '耕地', '水体', '蔬菜大棚', '水产养殖', '彩钢房', '光伏', '建筑工地']
const detectionTags = ['高尔夫球场', '井盖', '灯杆', '高压线塔', '储油罐', '风力发电机', '桥梁', '固化池', '烟雾火点']
const inversionTags = ['土壤含水率', '水质参数']



// 获取3D饼图数据 - 生成顶面、底面和侧面（带厚度）
function getPie3D(pieData) {
  const series = []
  let sumValue = 0
  let startValue = 0
  let endValue = 0

  for (let i = 0; i < pieData.length; i++) {
    sumValue += pieData[i].value
  }

  const thickness = 0.3 // 饼图厚度
  const innerRadius = 0.3 // 内圈半径（圆孔大小）

  for (let i = 0; i < pieData.length; i++) {
    const item = pieData[i]
    endValue = startValue + item.value
    const startRatio = startValue / sumValue
    const endRatio = endValue / sumValue
    const startRadian = startRatio * Math.PI * 2
    const endRadian = endRatio * Math.PI * 2

    // 1. 顶面（上表面）
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

    // 2. 底面（下表面）
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

    // 3. 外侧面（弧形侧面）
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

    // 4. 内侧面（内孔侧面）
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

    // 5. 起始侧面（径向平面）
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

    // 6. 结束侧面（径向平面）
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

  const pieData = [
    { value: 15, name: '语义分割', itemStyle: { color: '#42ACFF' } },
    { value: 9, name: '目标检测', itemStyle: { color: '#52C41A' } },
    { value: 2, name: '参数反演', itemStyle: { color: '#FAAD14' } }
  ]

  const series = getPie3D(pieData)

  // 添加标签显示
  pieData.forEach((item, index) => {
    const startRadian = (pieData.slice(0, index).reduce((sum, d) => sum + d.value, 0) / pieData.reduce((sum, d) => sum + d.value, 0)) * Math.PI * 2
    const endRadian = ((pieData.slice(0, index + 1).reduce((sum, d) => sum + d.value, 0)) / pieData.reduce((sum, d) => sum + d.value, 0)) * Math.PI * 2
    const midRadian = (startRadian + endRadian) / 2
    const radius = 0.85
    const x = Math.cos(midRadian) * radius
    const y = Math.sin(midRadian) * radius

    series.push({
      name: item.name + '_label',
      type: 'scatter3D',
      symbolSize: 0,
      itemStyle: {
        color: item.itemStyle.color
      },
      data: [[x, y, 0.25]],
      label: {
        show: true,
        formatter: `${item.name} {value|${item.value}}`,
        rich: {
          value: {
            fontSize: 16,
            fontWeight: 'bold',
            color: item.itemStyle.color
          }
        },
        fontSize: 14,
        color: '#fff',
        position: 'right',
        distance: 20
      }
    })
  })

  // 添加底部环形装饰
  series.push({
    name: 'ring',
    type: 'surface',
    parametric: true,
    wireframe: { show: false },
    itemStyle: {
      color: '#42ACFF',
      opacity: 0.1
    },
    parametricEquation: {
      u: { min: 0, max: Math.PI * 2, step: Math.PI / 40 },
      v: { min: 1.1, max: 1.3, step: 0.05 },
      x: function (u, v) { return Math.cos(u) * v },
      y: function (u, v) { return Math.sin(u) * v },
      z: function (u, v) { return -0.05 }
    }
  })

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      show: true,
      formatter: (params) => {
        if (params.seriesName !== 'mouseoutSeries' && !params.seriesName.includes('_label')) {
          const dataItem = pieData.find(item => params.seriesName.startsWith(item.name))
          return `${dataItem.name}<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${dataItem.itemStyle.color};"></span>${dataItem.value}`
        }
      }
    },
    xAxis3D: {
      min: -1.5,
      max: 1.5
    },
    yAxis3D: {
      min: -1.5,
      max: 1.5
    },
    zAxis3D: {
      min: -0.5,
      max: 0.5
    },
    grid3D: {
      show: false,
      boxHeight: 40,
      viewControl: {
        alpha: 35,
        beta: 25,
        distance: 220,
        autoRotate: true,
        autoRotateSpeed: 6
      },
      light: {
        main: {
          intensity: 1.2,
          shadow: true,
          shadowQuality: 'high'
        },
        ambient: {
          intensity: 0.3
        }
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
.model-library-stats {
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

/* 图表容器 */
.chart-container {
  width: 100%;
  height: 240px;
  margin-bottom: 12px;
}

/* 分类列表 */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 8px;
}

.category-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.category-name {
  font-size: 14px;
  color: #C0E8FF;
  font-weight: 500;
}

/* 标签列表 */
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-left: 18px;
}

.tag {
  padding: 4px 12px;
  background: rgba(66, 172, 255, 0.15);
  border: 1px solid rgba(66, 172, 255, 0.3);
  border-radius: 4px;
  font-size: 12px;
  color: #C0E8FF;
  white-space: nowrap;
}
</style>

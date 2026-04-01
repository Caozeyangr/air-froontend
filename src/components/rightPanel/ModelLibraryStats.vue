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

  // 甜甜圈 3D 饼图：中间镂空，两边实心；高度随数值差异化
  const innerRadius = 0.48 // 内孔半径加大一点，让中间空心更明显
  // “扁平”效果：整体厚度更薄
  const minHeight = 0.12
  const maxHeight = 0.22
  const maxValue = Math.max(...pieData.map(d => d.value))

  for (let i = 0; i < pieData.length; i++) {
    const item = pieData[i]
    endValue = startValue + item.value
    const startRatio = startValue / sumValue
    const endRatio = endValue / sumValue
    const startRadian = startRatio * Math.PI * 2
    const endRadian = endRatio * Math.PI * 2
    const midRadian = (startRadian + endRadian) / 2
    const offsetX = 0 // 无间隔：不爆炸
    const offsetY = 0

    const thickness = minHeight + ((item.value / maxValue) * (maxHeight - minHeight))

    // 颜色：顶面更亮，侧面更暗，营造“高光+渐变”科技感
    const topColor = item.itemStyle?.topColor || item.itemStyle?.color
    const sideColor = item.itemStyle?.sideColor || item.itemStyle?.color

    // 1. 顶面（上表面）
    series.push({
      name: item.name,
      type: 'surface',
      parametric: true,
      wireframe: { show: false },
      itemStyle: {
        color: topColor,
        opacity: 1,
      },
      parametricEquation: {
        u: { min: startRadian, max: endRadian, step: (endRadian - startRadian) / 40 },
        // v 从 innerRadius 开始，中心会形成镂空
        v: { min: innerRadius, max: 1, step: (1 - innerRadius) / 16 },
        x: function (u, v) { return Math.cos(u) * v + offsetX },
        y: function (u, v) { return Math.sin(u) * v + offsetY },
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
        color: sideColor,
        opacity: 0.95
      },
      parametricEquation: {
        u: { min: startRadian, max: endRadian, step: (endRadian - startRadian) / 40 },
        v: { min: innerRadius, max: 1, step: (1 - innerRadius) / 16 },
        x: function (u, v) { return Math.cos(u) * v + offsetX },
        y: function (u, v) { return Math.sin(u) * v + offsetY },
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
        color: sideColor,
        opacity: 0.9
      },
      parametricEquation: {
        u: { min: startRadian, max: endRadian, step: (endRadian - startRadian) / 40 },
        v: { min: 0, max: thickness, step: thickness / 8 },
        x: function (u, v) { return Math.cos(u) + offsetX },
        y: function (u, v) { return Math.sin(u) + offsetY },
        z: function (u, v) { return v }
      }
    })

    // 4. 内侧面（内孔边界：保证“中间镂空，两边实心”）
    series.push({
      name: item.name + '_inner',
      type: 'surface',
      parametric: true,
      wireframe: { show: false },
      itemStyle: {
        color: sideColor,
        opacity: 0.86
      },
      parametricEquation: {
        u: { min: startRadian, max: endRadian, step: (endRadian - startRadian) / 40 },
        v: { min: 0, max: thickness, step: thickness / 8 },
        x: function (u, v) { return Math.cos(u) * innerRadius + offsetX },
        y: function (u, v) { return Math.sin(u) * innerRadius + offsetY },
        z: function (u, v) { return v }
      }
    })

    // 5. 起始侧面（径向平面：范围从内半径到外半径）
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
        u: { min: innerRadius, max: 1, step: (1 - innerRadius) / 16 },
        v: { min: 0, max: thickness, step: thickness / 8 },
        x: function (u, v) { return Math.cos(startRadian) * u + offsetX },
        y: function (u, v) { return Math.sin(startRadian) * u + offsetY },
        z: function (u, v) { return v }
      }
    })

    // 6. 结束侧面（径向平面：范围从内半径到外半径）
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
        u: { min: innerRadius, max: 1, step: (1 - innerRadius) / 16 },
        v: { min: 0, max: thickness, step: thickness / 8 },
        x: function (u, v) { return Math.cos(endRadian) * u + offsetX },
        y: function (u, v) { return Math.sin(endRadian) * u + offsetY },
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
    {
      value: 15,
      name: '语义分割',
      itemStyle: { color: '#42ACFF', topColor: '#56C2FF', sideColor: '#2F6BFF' },
    }, // 蓝（高光+宝蓝）
    {
      value: 9,
      name: '目标检测',
      itemStyle: { color: '#F5B83A', topColor: '#FFD46B', sideColor: '#F08A1A' },
    }, // 黄橙（高光+橙）
    {
      value: 2,
      name: '参数反演',
      itemStyle: { color: '#22D3A6', topColor: '#36F0D0', sideColor: '#14B89D' },
    }, // 青绿（高光+薄荷）
  ]

  const series = getPie3D(pieData)

  // 外侧标注：分类名 + 数值分开展示；引导线统一浅灰；文字颜色跟随扇区
  pieData.forEach((item, index) => {
    const startRadian = (pieData.slice(0, index).reduce((sum, d) => sum + d.value, 0) / pieData.reduce((sum, d) => sum + d.value, 0)) * Math.PI * 2
    const endRadian = ((pieData.slice(0, index + 1).reduce((sum, d) => sum + d.value, 0)) / pieData.reduce((sum, d) => sum + d.value, 0)) * Math.PI * 2
    const midRadian = (startRadian + endRadian) / 2

    // 与饼图顶面高度一致：把引导线从“饼图上方”开始
    const minHeight = 0.12
    const maxHeight = 0.22
    const maxValue = Math.max(...pieData.map(d => d.value))
    const thickness = minHeight + ((item.value / maxValue) * (maxHeight - minHeight))
    const topZ = thickness + 0.03
    // A：折点必须落在 midRadian 的径向射线上（x=cos(mid)*r, y=sin(mid)*r）
    // 左边：水平->沿径向斜向下入饼图；右边：沿径向斜向上出饼图->水平
    // 控制水平引导线的外侧长度（数值越大，水平线越长）
    const xOuterAbs = 2.35
    const rEdge = 1.02
    const sign = Math.cos(midRadian) >= 0 ? 1 : -1
    const cosMid = Math.cos(midRadian)
    const sinMid = Math.sin(midRadian)

    const xEdge = cosMid * rEdge
    const yEdge = sinMid * rEdge
    const length1 = 0.18 // 短斜段长度（决定折点距外缘的距离）
    const rBend = rEdge + length1
    const xBend = cosMid * rBend
    const yBend = sinMid * rBend

    const xEnd = sign * xOuterAbs
    const yEnd = yBend
    const zPie = topZ + 0.01
    const zBend = topZ + 0.04

    // 引导线（下层）
    series.push({
      name: item.name + '_line',
      type: 'line3D',
      // 左边：水平段 -> 斜向下插入饼图
      // 右边：斜向上从饼图 -> 水平段
      data: sign < 0
        ? [[xEnd, yEnd, zBend], [xBend, yEnd, zBend], [xEdge, yEdge, zPie]]
        : [[xEdge, yEdge, zPie], [xBend, yEnd, zBend], [xEnd, yEnd, zBend]],
      lineStyle: {
        width: 1.0,
        color: '#75ACD7',
        opacity: 1,
      },
      silent: true,
    })

    // 统一单标签：避免“数字标签 + 文字标签”在同一水平线重叠
    // 右侧：数字在前（9 目标检测）；左侧：文字在前（语义分割 15）
    series.push({
      name: item.name + '_label',
      type: 'scatter3D',
      symbolSize: 0,
      itemStyle: { color: item.itemStyle.color },
      data: [[xEnd, yEnd, 0.30]],
      label: {
        show: true,
        formatter: () => sign > 0
          ? `{value|${item.value}} {name|${item.name}}`
          : `{name|${item.name}} {value|${item.value}}`,
        rich: {
          value: {
            width: 10,
            height: 24,
            fontFamily: 'DINAlternate, DINAlternate',
            fontSize: 20,
            fontWeight: 'bold',
            color: item.itemStyle.color,
            lineHeight: 24,
            align: sign > 0 ? 'left' : 'right',
          },
          name: {
            width: 56,
            height: 20,
            fontFamily: 'SourceHanSansCN, SourceHanSansCN',
            fontSize: 14,
            fontWeight: 500,
            color: item.itemStyle.color,
            lineHeight: 20,
            align: sign > 0 ? 'right' : 'left',
          }
        },
        color: item.itemStyle.color,
        align: sign > 0 ? 'right' : 'left',
        verticalAlign: 'middle',
        distance: 0,
        padding: [0, 0, 0, 0],
      }
    })
  })

  // 悬浮平台：多层同心蓝色“水波纹”环（同心圆+轻微波纹），叠加形成悬浮感
  ;[
    { name: 'ripple_1', r0: 1.08, r1: 1.18, baseZ: -0.10, waveAmp: 0.018, freq: 10, color: '#56B7FF', opacity: 0.16 },
    { name: 'ripple_2', r0: 1.20, r1: 1.30, baseZ: -0.12, waveAmp: 0.015, freq: 12, color: '#56B7FF', opacity: 0.10 },
    { name: 'ripple_3', r0: 1.34, r1: 1.44, baseZ: -0.14, waveAmp: 0.012, freq: 14, color: '#82CBFF', opacity: 0.07 },
    { name: 'ripple_4', r0: 1.50, r1: 1.60, baseZ: -0.16, waveAmp: 0.010, freq: 16, color: '#B5E5FF', opacity: 0.05 },
  ].forEach(r => {
    series.push({
      name: r.name,
      type: 'surface',
      parametric: true,
      wireframe: { show: false },
      itemStyle: { color: r.color, opacity: r.opacity },
      parametricEquation: {
        u: { min: 0, max: Math.PI * 2, step: Math.PI / 72 },
        v: { min: r.r0, max: r.r1, step: 0.02 },
        x: function (u, v) { return Math.cos(u) * v },
        y: function (u, v) { return Math.sin(u) * v },
        z: function (u, v) {
          // 轻微波纹：让同心环看起来“在发光并有水波纹理”
          return r.baseZ + r.waveAmp * Math.sin(u * r.freq + v * 2.2)
        }
      }
    })
  })

  // 科技网格盘（更下层，wireframe 形成网格感）
  series.push({
    name: 'platform_grid',
    type: 'surface',
    parametric: true,
    wireframe: {
      show: true,
      lineStyle: {
        color: 'rgba(86, 183, 255, 0.22)',
        width: 1,
      }
    },
    itemStyle: { color: '#56B7FF', opacity: 0.025 },
    parametricEquation: {
      u: { min: 0, max: Math.PI * 2, step: Math.PI / 60 },
      v: { min: 0, max: 1.95, step: 0.06 },
      x: function (u, v) { return Math.cos(u) * v },
      y: function (u, v) { return Math.sin(u) * v },
      z: function () { return -0.18 }
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
      boxHeight: 52,
      viewControl: {
        // 更平一些的俯视：角度从 45° 调整到 30°
        alpha: 30,       // 0 是侧视，90 是正上方，这里取 30° 更接近平视
        beta: 0,
        distance: 190,   // 再拉近一点，让饼图整体更大
        minAlpha: 30,
        maxAlpha: 30,
        minBeta: 0,
        maxBeta: 0,
        animation: false,
        autoRotate: false,
        zoomSensitivity: 0,
        rotateSensitivity: 0,
        panSensitivity: 0,
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
  padding: 0 12px 0 16px;
  background: linear-gradient(270deg, #42ACFF 0%, rgba(211, 235, 255, 0) 100%);
  text-align: right;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
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
  height: 220px;
  margin-bottom: 8px;
}

/* 分类列表 */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 4px;
}

.category-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.category-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.category-name {
  font-size: 14px;
  color: #536d82;
  font-weight: 500;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding-left: 0;
}

.tag {
  height: 18px;
  padding: 0 8px;
  background: #7faccd;
  border: 0;
  border-radius: 2px;
  font-size: 13px;
  line-height: 18px;
  color: #fff;
  white-space: nowrap;
}
</style>

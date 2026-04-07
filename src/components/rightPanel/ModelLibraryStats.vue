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
          <span class="category-dot" style="background: #F5B83A;"></span>
          <span class="category-name">目标检测</span>
        </div>
        <div class="tag-list">
          <span v-for="tag in detectionTags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>

      <div class="category-item">
        <div class="category-header">
          <span class="category-dot" style="background: #22D3A6;"></span>
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
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import * as echarts from 'echarts'
import 'echarts-gl'



const chartRef = ref(null)
let chart = null

const semanticTags = ['建筑物', '道路', '林地', '耕地', '水体', '蔬菜大棚', '水产养殖', '彩钢房', '光伏', '建筑工地']
const detectionTags = ['高尔夫球场', '井盖', '灯杆', '高压线塔', '储油罐', '风力发电机', '桥梁', '固化池', '烟雾火点']
const inversionTags = ['土壤含水率', '水质参数']



// 扇形曲面参数方程（经典 3D 饼图近似实现）
function getParametricEquation(startRatio, endRatio, isSelected, isHovered, k, h) {
  const midRatio = (startRatio + endRatio) / 2
  const startRadian = startRatio * Math.PI * 2
  const endRadian = endRatio * Math.PI * 2
  const midRadian = midRatio * Math.PI * 2
  isSelected = false
  const kk = typeof k !== 'undefined' ? k : 1 / 3
  const offsetX = isSelected ? Math.sin(midRadian) * 0.1 : 0
  const offsetY = isSelected ? Math.cos(midRadian) * 0.1 : 0
  const hoverRate = isHovered ? 1.05 : 1
  return {
    u: { min: -Math.PI, max: Math.PI * 3, step: Math.PI / 32 },
    v: { min: 0, max: Math.PI * 2, step: Math.PI / 20 },
    x: function (u, v) {
      if (u < startRadian) {
        return offsetX + Math.cos(startRadian) * (1 + Math.cos(v) * kk) * hoverRate
      }
      if (u > endRadian) {
        return offsetX + Math.cos(endRadian) * (1 + Math.cos(v) * kk) * hoverRate
      }
      return offsetX + Math.cos(u) * (1 + Math.cos(v) * kk) * hoverRate
    },
    y: function (u, v) {
      if (u < startRadian) {
        return offsetY + Math.sin(startRadian) * (1 + Math.cos(v) * kk) * hoverRate
      }
      if (u > endRadian) {
        return offsetY + Math.sin(endRadian) * (1 + Math.cos(v) * kk) * hoverRate
      }
      return offsetY + Math.sin(u) * (1 + Math.cos(v) * kk) * hoverRate
    },
    z: function (u, v) {
      if (u < -Math.PI * 0.5) {
        return Math.sin(u) * h * 0.1
      }
      if (u > Math.PI * 2.5) {
        return Math.sin(u) * h * 0.1
      }
      // 让上下表面高度都随 h 缩放，避免出现“过高的立起来的厚度”
      return Math.sin(v) > 0 ? 1 * h * 0.1 : -1 * h * 0.1
    }
  }
}

// 3D 饼图：parametric surface 扇区（internalDiameterRatio 控制镂空，如 0.6）
function getPie3D(pieData, internalDiameterRatio) {
  const series = []
  let sumValue = 0
  let startValue = 0
  let endValue = 0
  const maxValue = Math.max(...pieData.map(d => d.value))
  const k =
    typeof internalDiameterRatio !== 'undefined'
      ? (1 - internalDiameterRatio) / (1 + internalDiameterRatio)
      : 1 / 3

  for (let i = 0; i < pieData.length; i++) {
    sumValue += pieData[i].value
    const seriesItem = {
      name: typeof pieData[i].name === 'undefined' ? `series${i}` : pieData[i].name,
      type: 'surface',
      parametric: true,
      wireframe: { show: false },
      pieData: pieData[i],
      pieStatus: { selected: false, hovered: false, k: 1 / 10 }
    }
    if (pieData[i].itemStyle) {
      const itemStyle = {}
      if (pieData[i].itemStyle.color != null) itemStyle.color = pieData[i].itemStyle.color
      if (pieData[i].itemStyle.opacity != null) itemStyle.opacity = pieData[i].itemStyle.opacity
      seriesItem.itemStyle = itemStyle
    }
    series.push(seriesItem)
  }

  for (let i = 0; i < series.length; i++) {
    endValue = startValue + series[i].pieData.value
    series[i].pieData.startRatio = startValue / sumValue
    series[i].pieData.endRatio = endValue / sumValue

    // 保持“总体很扁”的最高高度不变：最大值扇区为 1，其它按比例降低
    const hScale = maxValue > 0 ? (series[i].pieData.value / maxValue) : 1
    series[i].parametricEquation = getParametricEquation(
      series[i].pieData.startRatio,
      series[i].pieData.endRatio,
      false,
      false,
      k,
      hScale
    )
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

  const series = getPie3D(pieData, 0.6)

  // 外侧标注：分类名 + 数值分开展示；引导线统一浅灰；文字颜色跟随扇区
  pieData.forEach((item, index) => {
    const startRadian = (pieData.slice(0, index).reduce((sum, d) => sum + d.value, 0) / pieData.reduce((sum, d) => sum + d.value, 0)) * Math.PI * 2
    const endRadian = ((pieData.slice(0, index + 1).reduce((sum, d) => sum + d.value, 0)) / pieData.reduce((sum, d) => sum + d.value, 0)) * Math.PI * 2
    const midRadian = (startRadian + endRadian) / 2

    // 与饼图顶面高度一致：把引导线从“饼图上方”开始
    // 与饼图真实厚度一致（最高仍很扁），让三块呈现“有高有低”
    const maxValue = Math.max(...pieData.map(d => d.value))
    const hScale = maxValue > 0 ? (item.value / maxValue) : 1
    const thickness = 0.1 * hScale
    const topZ = thickness + 0.03
    // A：折点必须落在 midRadian 的径向射线上（x=cos(mid)*r, y=sin(mid)*r）
    // 左边：水平->沿径向斜向下入饼图；右边：沿径向斜向上出饼图->水平
    // 控制水平引导线的外侧长度（数值越大，水平线越长）
    // 右侧“参数反演”避免出界：保持 xEnd 在 xAxis3D 范围内
    // 目标检测单独加长引导线，便于文字远离扇区
    const xOuterAbs = item.name === '目标检测' ? 1.62 : 1.35
    const rEdge = 1.02
    const sign = Math.cos(midRadian) >= 0 ? 1 : -1
    const cosMid = Math.cos(midRadian)
    const sinMid = Math.sin(midRadian)

    const xEdge = cosMid * rEdge
    const yEdge = sinMid * rEdge
    const length1 = item.name === '目标检测' ? 0.30 : 0.18 // 目标检测单独加长引导线
    const rBend = rEdge + length1
    const xBend = cosMid * rBend
    const yBend = sinMid * rBend

    const xEnd = sign * xOuterAbs
    const yEnd = yBend
    // 分类别微调标注，避免与饼图/彼此重叠
    const labelOffsetY = item.name === '语义分割'
      ? 0.08
      : item.name === '目标检测'
        ? -0.16
        : 0.02
    const labelOffsetX = item.name === '目标检测'
      ? -0.30
      : (sign < 0 ? -0.05 : 0.04)
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
      // 扁平化后饼面高度降低：标签点 z 同步下调，贴近饼面观感
      data: [[xEnd + labelOffsetX, yEnd + labelOffsetY, 0.22]],
      label: {
        show: true,
        formatter: () => sign > 0
          ? `{value|${item.value}} {name|${item.name}}`
          : `{name|${item.name}} {value|${item.value}}`,
        rich: {
          value: {
            width: 22,
            height: 24,
            fontFamily: 'DINAlternate, DINAlternate',
            fontSize: 20,
            fontWeight: 'bold',
            color: item.itemStyle.color,
            lineHeight: 24,
            align: sign > 0 ? 'left' : 'right',
            padding: sign > 0 ? [0, 0, 0, 4] : [0, 4, 0, 0],
          },
          name: {
            width: 62,
            height: 20,
            fontFamily: 'SourceHanSansCN, SourceHanSansCN',
            fontSize: 14,
            fontWeight: 500,
            color: item.itemStyle.color,
            lineHeight: 20,
            align: sign > 0 ? 'right' : 'left',
            padding: sign > 0 ? [0, 4, 0, 0] : [0, 0, 0, 4],
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
        if (params.seriesName !== 'mouseoutSeries' && !params.seriesName.includes('_label') && !params.seriesName.includes('_line')) {
          const dataItem = pieData.find(item => params.seriesName.startsWith(item.name))
          if (!dataItem) return ''
          return `${dataItem.name}<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${dataItem.itemStyle.color};"></span>${dataItem.value}`
        }
      }
    },
    xAxis3D: {
      min: -1.35,
      max: 1.35
    },
    yAxis3D: {
      min: -1.35,
      max: 1.35
    },
    zAxis3D: {
      min: -0.6,
      max: 0.6
    },
    grid3D: {
      show: false,
      boxHeight: 52,
      viewControl: {
        // 自动旋转 + 可拖拽；勿限制 alpha/beta 范围，否则 autoRotate 很快会被夹住看起来像不转
        alpha: 20,
        beta: 15,
        distance: 175,
        autoRotate: true,
        autoRotateSpeed: 14,
        autoRotateDirection: 'cw',
        zoomSensitivity: 0,
        rotateSensitivity: 1,
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
  margin-bottom: 0;
  margin-top: 14px; /* 与上方模型库卡片拉开距离（明显可见） */
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

.title-count {
  margin-left: 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

/* 图表容器 */
.chart-container {
  width: 100%;
  height: 200px;
  margin-top: -6px;  /* 饼图贴近标题栏 */
  margin-bottom: 0;
}

/* 分类列表 */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 4px;
  margin-top: -10px; /* 图文间距按图5收紧 */
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

<template>
  <div class="bj-map">
    <div ref="chartRef" class="bj-map__chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import * as Cesium from 'cesium'

const chartRef = ref(null)
let chart = null
let resizeObserver = null

const colors = '#f9b207'

let cesiumViewer = null
let postRenderListener = null
let rafId = null
let lastRenderAt = 0

async function loadMarkers() {
  const res = await fetch('/markers-popup.json')
  if (!res.ok) throw new Error(`markers load failed: ${res.status}`)
  return await res.json()
}

function pickCenterAndTargets(markers) {
  const centerMarker =
    markers.find((m) => m.id === 'beijing' || m.name === '北京') || {
      id: 'beijing',
      name: '北京',
      lon: 116.4074,
      lat: 39.9042
    }

  // 目标点：直接使用首页点位（除北京外，所有带经纬度的点都参与辐射）
  const targets = markers
    .filter((m) => m && m.lon != null && m.lat != null)
    .filter((m) => m.name !== centerMarker.name)
    .filter((m) => m.id !== centerMarker.id)
  return { centerMarker, targets }
}

function buildOption(w, h, centerMarker, targets) {
  const centerPx = getScreenPx(centerMarker, w, h)
  if (!centerPx) return null

  const points = targets.map((m) => {
    const px = getScreenPx(m, w, h)
    if (!px) return null
    return { name: m.name, value: [...px, 100] }
  })
  .filter(Boolean)

  const linesData = targets.map((m) => {
    const toPx = getScreenPx(m, w, h)
    if (!toPx) return null
    return { coords: [centerPx, toPx] }
  })
  .filter(Boolean)

  return {
    backgroundColor: 'transparent',
    animation: false,
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: {
      type: 'value',
      min: 0,
      max: w,
      show: false
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: h,
      show: false,
      inverse: true // 与屏幕 y 方向一致
    },
    series: [
      // 北京中心点
      {
        type: 'effectScatter',
        coordinateSystem: 'cartesian2d',
        data: [{ name: centerMarker.name, value: [...centerPx, 120] }],
        symbolSize: 10,
        showEffectOn: 'render',
        rippleEffect: { brushType: 'stroke' },
        label: { show: false },
        itemStyle: { color: '#34C8FF', shadowBlur: 10, shadowColor: '#34C8FF' },
        z: 3
      },
      // 外围点
      {
        type: 'effectScatter',
        coordinateSystem: 'cartesian2d',
        data: points,
        symbolSize: (val) => val[2] / 10,
        showEffectOn: 'render',
        rippleEffect: { brushType: 'stroke' },
        hoverAnimation: false,
        label: { show: false },
        itemStyle: { color: colors, shadowBlur: 10, shadowColor: colors },
        z: 2
      },
      // 辐射线（北京 -> 外围点）
      {
        type: 'lines',
        coordinateSystem: 'cartesian2d',
        z: 2,
        effect: {
          show: true,
          period: 4,
          trailLength: 0.02,
          symbol: 'arrow',
          symbolSize: 3
        },
        lineStyle: {
          color: colors,
          width: 0.8,
          opacity: 0.6,
          curveness: 0.3
        },
        data: linesData
      }
    ]
  }
}

function getScreenPx(marker, w, h) {
  if (!marker || marker.lon == null || marker.lat == null) return null
  if (!cesiumViewer) return null
  const cartesian = Cesium.Cartesian3.fromDegrees(marker.lon, marker.lat, 0)
  const c = Cesium.SceneTransforms.wgs84ToWindowCoordinates(cesiumViewer.scene, cartesian)
  if (!c) return null
  // 保护：只取落在当前可视范围内的点（否则线会从边缘乱飞）
  if (c.x < -50 || c.y < -50 || c.x > w + 50 || c.y > h + 50) return null
  return [c.x, c.y]
}

async function init() {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value, null, { renderer: 'canvas' })
  const dom = chart.getDom()
  if (dom) {
    dom.style.pointerEvents = 'none'
    dom.querySelectorAll('canvas').forEach((c) => {
      c.style.pointerEvents = 'none'
    })
  }

  if (typeof window !== 'undefined') {
    cesiumViewer = window.__airCesiumViewer || null
  }

  const markers = await loadMarkers()
  const { centerMarker, targets } = pickCenterAndTargets(markers)

  const render = () => {
    if (!chartRef.value) return
    const w = chartRef.value.clientWidth || 0
    const h = chartRef.value.clientHeight || 0
    if (w <= 0 || h <= 0) return
    const option = buildOption(w, h, centerMarker, targets)
    if (!option) return
    chart.setOption(option, { notMerge: true, lazyUpdate: true, silent: true })
  }

  const scheduleRender = () => {
    const now = performance.now()
    if (now - lastRenderAt < 80) return
    if (rafId != null) return
    rafId = requestAnimationFrame(() => {
      rafId = null
      lastRenderAt = performance.now()
      render()
    })
  }

  render()

  resizeObserver = new ResizeObserver(() => {
    chart?.resize()
    scheduleRender()
  })
  resizeObserver.observe(chartRef.value)

  // 随 Cesium 相机/渲染帧更新，保证屏幕坐标完全对齐
  if (cesiumViewer?.scene) {
    postRenderListener = () => scheduleRender()
    cesiumViewer.scene.postRender.addEventListener(postRenderListener)
  }
}

onMounted(() => {
  init().catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e)
  })
})

onBeforeUnmount(() => {
  if (resizeObserver && chartRef.value) {
    resizeObserver.unobserve(chartRef.value)
    resizeObserver = null
  }
  if (cesiumViewer?.scene && postRenderListener) {
    cesiumViewer.scene.postRender.removeEventListener(postRenderListener)
    postRenderListener = null
  }
  if (rafId != null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  if (chart) {
    chart.dispose()
    chart = null
  }
})
</script>

<style scoped>
/* 必须穿透到子页面 canvas：辐射仅展示，不参与点击（否则会挡 Cesium 点位拾取） */
.bj-map,
.bj-map__chart {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none !important;
}
</style>


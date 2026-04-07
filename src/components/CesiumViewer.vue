<template>
  <div ref="cesiumWrapRef" class="cesium-wrap">
    <div ref="cesiumContainer" class="cesium-container"></div>
    <!-- 点位选中态虚线框（跟随屏幕坐标） -->
    <div
      v-show="selectedBoxVisible"
      class="marker-selected-box"
      :style="selectedBoxStyle"
      @click.stop
    ></div>
    <!-- 点位弹窗（HTML 浮层，跟随地图坐标） -->
    <div
      v-show="popupVisible"
      ref="popupRef"
      class="marker-popup"
      :class="{
        'marker-popup--right': popupAlign === 'right',
        'marker-popup--bottom': popupPlacement === 'bottom',
        'marker-popup--top': popupPlacement === 'top'
      }"
      :style="popupWrapStyle"
      @click.stop
    >
      <button type="button" class="marker-popup-close" aria-label="关闭" @click="closePopup">×</button>
      <h3 class="marker-popup-title">{{ popupData.title }}</h3>
      <div
        class="marker-popup-body"
        :class="{ 'marker-popup-body--row': popupData.images && popupData.images.length }"
      >
        <div v-if="popupData.images && popupData.images.length" class="marker-popup-images">
          <img
            v-for="(src, idx) in popupData.images"
            :key="idx"
            :src="src"
            alt=""
            class="marker-popup-img"
            @error="onPopupImageError(idx)"
          />
        </div>
        <div class="marker-popup-text">
          <p class="marker-popup-summary">{{ popupData.summary }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted, reactive, nextTick } from 'vue'
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import bgImg from '@/assets/content/背景.png'

const cesiumWrapRef = ref(null)
const cesiumContainer = ref(null)
let viewer = null
let clickHandler = null
let postRenderListener = null
let domClickHandler = null

const ORANGE = Cesium.Color.fromCssColorString('#FF9430')
const BLUE = Cesium.Color.fromCssColorString('#165DFF')
const LABEL_TEXT = Cesium.Color.WHITE

// 选中/未选中图标（未选中蓝色由运行时从橙色图标色相变换得到）
const iconOrangeUrl = '/map/popup/定位 选中@2x.png'
let iconBlueDataUrl = iconOrangeUrl

// 显示所有有效点位：lon/lat=0/0 属于占位数据（不展示）
function isActiveMarker(m) {
  const lon = Number(m?.lon)
  const lat = Number(m?.lat)
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return false
  if (lon === 0 && lat === 0) return false
  return true
}

const popupVisible = ref(false)
const popupData = reactive({
  title: '',
  summary: '',
  images: []
})
const popupScreen = ref({ x: 0, y: 0 })
/** 弹窗在锚点左侧或右侧，避免贴边或与标牌重叠 */
const popupAlign = ref('left')
/** 弹窗在地图容器内的像素校正，保证不裁切 */
const popupNudge = ref({ x: 0, y: 0 })
const popupRef = ref(null)
const popupPlacement = ref('side')
/** 当前用于定位的笛卡尔坐标（随相机更新重算屏幕位置） */
let activePopupPosition = null
/** pick 失败时用于弹窗锚点的屏幕坐标（避免 translate 到视口外） */
let popupAnchorScreenFallback = null
/** 用于屏幕距离拾取（不依赖 scene.pick / drillPick） */
let markersForPick = []

// 点位选中态（控制样式与虚线框）
const selectedMarkerId = ref(null)
let selectedMarkerWorld = null
const selectedBoxVisible = ref(false)
const selectedBoxScreen = ref({ x: 0, y: 0 })
const selectedBoxStyle = computed(() => ({
  left: `${selectedBoxScreen.value.x}px`,
  top: `${selectedBoxScreen.value.y}px`
}))

/** marker id -> { billboardEntity } */
const markerEntities = new Map()

const POPUP_W = 446
const POPUP_H_EST = 340
const POPUP_GAP = 40
const POPUP_ANCHOR_UP = 28
const POPUP_BOTTOM_GAP = 14
const POPUP_TOP_GAP = 14

function refreshPopupNudge() {
  const wrap = cesiumWrapRef.value
  const popupEl = popupRef.value
  if (!popupVisible.value || !wrap || !popupEl) return

  const wrapRect = wrap.getBoundingClientRect()
  const popupRect = popupEl.getBoundingClientRect()
  const margin = 12
  // 中间地图安全区域：避开左/右侧面板与底部栏
  const leftInset = Math.min(430, wrapRect.width * 0.22)
  const rightInset = Math.min(430, wrapRect.width * 0.22)
  const topInset = Math.min(140, wrapRect.height * 0.12)
  const bottomInset = Math.min(140, wrapRect.height * 0.12)
  const safeLeft = wrapRect.left + leftInset + margin
  const safeRight = wrapRect.right - rightInset - margin
  const safeTop = wrapRect.top + topInset + margin
  const safeBottom = wrapRect.bottom - bottomInset - margin

  let nx = popupNudge.value.x
  let ny = popupNudge.value.y

  if (popupRect.left < safeLeft) nx += safeLeft - popupRect.left
  if (popupRect.right > safeRight) nx -= popupRect.right - safeRight

  if (popupRect.top < safeTop) ny += safeTop - popupRect.top
  if (popupRect.bottom > safeBottom) ny -= popupRect.bottom - safeBottom

  popupNudge.value = { x: nx, y: ny }
}

const popupWrapStyle = computed(() => {
  const { x: nx, y: ny } = popupNudge.value
  if (popupPlacement.value === 'bottom') {
    return {
      left: `${popupScreen.value.x}px`,
      top: `${popupScreen.value.y}px`,
      transform: `translate(calc(-50% + ${nx}px), ${POPUP_BOTTOM_GAP + ny}px)`
    }
  }
  if (popupPlacement.value === 'top') {
    return {
      left: `${popupScreen.value.x}px`,
      top: `${popupScreen.value.y}px`,
      transform: `translate(calc(-50% + ${nx}px), calc(-100% - ${POPUP_TOP_GAP}px + ${ny}px))`
    }
  }

  const tr =
    popupAlign.value === 'right'
      ? `translate(${POPUP_GAP + nx}px, calc(-50% - ${POPUP_ANCHOR_UP}px + ${ny}px))`
      : `translate(calc(-100% - ${POPUP_GAP}px + ${nx}px), calc(-50% - ${POPUP_ANCHOR_UP}px + ${ny}px))`
  return {
    left: `${popupScreen.value.x}px`,
    top: `${popupScreen.value.y}px`,
    transform: tr
  }
})

const webMercatorProjection = new Cesium.WebMercatorProjection()

function fromWebMercator(x, y, height = 0) {
  const cartographic = webMercatorProjection.unproject(new Cesium.Cartesian3(x, y, 0))
  return Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height)
}

function toWebMercator(lon, lat) {
  const cartographic = Cesium.Cartographic.fromDegrees(lon, lat)
  const cartesian = webMercatorProjection.project(cartographic)
  return { x: cartesian.x, y: cartesian.y }
}

function fromDegreesArrayToWebMercator(degreesArray) {
  const result = []
  for (let i = 0; i < degreesArray.length; i += 2) {
    const lon = degreesArray[i]
    const lat = degreesArray[i + 1]
    const wm = toWebMercator(lon, lat)
    result.push(fromWebMercator(wm.x, wm.y))
  }
  return result
}

function geometryToRings(geometry) {
  if (!geometry || !geometry.type || !geometry.coordinates) return []
  if (geometry.type === 'Polygon') return geometry.coordinates
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.flat()
  return []
}

function ringLonLatToPositions(ring, height = 0) {
  const positions = []
  for (let i = 0; i < ring.length; i++) {
    const p = ring[i]
    if (!Array.isArray(p) || p.length < 2) continue
    const lon = p[0]
    const lat = p[1]
    if (lon == null || lat == null) continue
    const wm = toWebMercator(lon, lat)
    positions.push(fromWebMercator(wm.x, wm.y, height))
  }
  return positions
}

function updatePopupAlignForScreenX(screenX) {
  if (popupPlacement.value === 'bottom') return
  const wrap = cesiumWrapRef.value
  const W = wrap?.clientWidth ?? (typeof window !== 'undefined' ? window.innerWidth : 1920)
  const threshold = Math.max(POPUP_W + POPUP_GAP + 24, W * 0.36)
  popupAlign.value = screenX < threshold ? 'right' : 'left'
}

function updatePopupScreenPosition() {
  if (!viewer || !activePopupPosition) return
  const scene = viewer.scene
  const c = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, activePopupPosition)
  if (c) {
    popupScreen.value = { x: c.x, y: c.y }
    updatePopupAlignForScreenX(c.x)
    refreshPopupNudge()
  } else if (popupAnchorScreenFallback) {
    popupScreen.value = {
      x: popupAnchorScreenFallback.x,
      y: popupAnchorScreenFallback.y
    }
    updatePopupAlignForScreenX(popupAnchorScreenFallback.x)
    refreshPopupNudge()
  }
}

function openPopup(payload, worldPosition, clickScreen) {
  const id = payload?.id || payload?.name || ''
  const isBayannur = id === 'bayannur' || payload?.name === '巴彦淖尔'
  const isWanning = id === 'wanning' || payload?.name === '海南万宁'

  popupPlacement.value = isWanning ? 'top' : isBayannur ? 'bottom' : 'side'
  popupNudge.value = { x: 0, y: 0 }

  popupData.title = payload?.title || payload?.name || ''
  popupData.summary = payload?.summary || payload?.title || payload?.name || '暂无详细介绍'
  popupData.images = Array.isArray(payload?.images)
    ? payload.images.filter((s) => typeof s === 'string' && s.trim().length > 0)
    : []

  activePopupPosition = worldPosition
  popupAnchorScreenFallback =
    clickScreen != null
      ? { x: clickScreen.x, y: clickScreen.y }
      : null

  const c = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, worldPosition)
  if (c) {
    popupScreen.value = { x: c.x, y: c.y }
    updatePopupAlignForScreenX(c.x)
  } else if (popupAnchorScreenFallback) {
    popupScreen.value = { ...popupAnchorScreenFallback }
    updatePopupAlignForScreenX(popupAnchorScreenFallback.x)
  }

  popupVisible.value = true
  // 让 DOM 先渲染出来，再用真实尺寸做边界夹紧
  nextTick(() => {
    refreshPopupNudge()
    requestAnimationFrame(() => refreshPopupNudge())
  })
}

function onPopupImageError(idx) {
  // 图片加载失败（404/路径错误）时，移除该缩略图避免 broken icon
  if (!Array.isArray(popupData.images)) return
  if (idx < 0 || idx >= popupData.images.length) return
  popupData.images.splice(idx, 1)
}

function closePopup() {
  popupVisible.value = false
  activePopupPosition = null
  popupAnchorScreenFallback = null
}

function updateSelectedBoxPosition() {
  if (!viewer || !selectedMarkerWorld) return
  const c = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, selectedMarkerWorld)
  if (c) {
    selectedBoxScreen.value = { x: c.x, y: c.y }
  }
}

function distSqScreen(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy
}

// 把鼠标 CSS 像素坐标转换到 Cesium windowCoordinates 使用的画布像素坐标
function toCesiumScreenPosition(pos) {
  if (!viewer?.scene?.canvas || !pos) return new Cesium.Cartesian2(pos?.x || 0, pos?.y || 0)
  const canvas = viewer.scene.canvas
  const ratioX = canvas.clientWidth > 0 ? canvas.width / canvas.clientWidth : 1
  const ratioY = canvas.clientHeight > 0 ? canvas.height / canvas.clientHeight : 1
  return new Cesium.Cartesian2(pos.x * ratioX, pos.y * ratioY)
}

/**
 * 优先按“图标矩形”命中：用户点到哪个标牌框，就打开哪个弹窗。
 * 这一步使用实体真实屏幕坐标，避免密集区被其它点误吸附。
 */
function tryOpenPopupByBillboardRect(clickScreen) {
  if (!viewer || !markerEntities?.size) return false

  const BOX_W = 86
  const BOX_H = 40
  const halfW = BOX_W / 2
  let best = null
  let bestSq = Infinity

  for (const [, entry] of markerEntities) {
    const entity = entry?.billboardEntity
    const m = entity?.popupPayload
    if (!entity || !m) continue

    const pos = entity.position?.getValue?.(viewer.clock.currentTime)
    if (!pos) continue
    const c = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, pos)
    if (!c) continue

    // billboard: horizontal=center, vertical=bottom
    const left = c.x - halfW
    const right = c.x + halfW
    const top = c.y - BOX_H
    const bottom = c.y

    if (clickScreen.x < left || clickScreen.x > right || clickScreen.y < top || clickScreen.y > bottom) {
      continue
    }

    // 同时命中多个框时，取距离框中心最近的一个
    const center = { x: c.x, y: (top + bottom) / 2 }
    const dSq = distSqScreen(clickScreen, center)
    if (dSq < bestSq) {
      bestSq = dSq
      best = { m, pos }
    }
  }

  if (best) {
    openPopup(best.m, best.pos, clickScreen)
    setSelectedMarker(best.m, best.pos)
    viewer.scene.requestRender()
    return true
  }
  return false
}

// 北京/营口/东营优先命中层：密集区先在这三点内判定，避免跳到巴彦淖尔
function tryOpenPopupByCoreThreeMarkers(clickScreen) {
  if (!viewer || !markerEntities?.size) return false
  const CORE_IDS = new Set(['beijing', 'yingkou-bayuquan', 'dongying'])
  const halfW = 44
  const boxH = 44

  let best = null
  let bestSq = Infinity

  for (const [id, entry] of markerEntities) {
    if (!CORE_IDS.has(String(id))) continue
    const entity = entry?.billboardEntity
    const m = entity?.popupPayload
    if (!entity || !m) continue

    const pos = entity.position?.getValue?.(viewer.clock.currentTime)
    if (!pos) continue
    const c = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, pos)
    if (!c) continue

    const left = c.x - halfW
    const right = c.x + halfW
    const top = c.y - boxH
    const bottom = c.y + 2
    if (clickScreen.x < left || clickScreen.x > right || clickScreen.y < top || clickScreen.y > bottom) {
      continue
    }

    const dSq = distSqScreen(clickScreen, { x: c.x, y: c.y - 22 })
    if (dSq < bestSq) {
      bestSq = dSq
      best = { m, pos }
    }
  }

  if (best) {
    openPopup(best.m, best.pos, clickScreen)
    setSelectedMarker(best.m, best.pos)
    viewer.scene.requestRender()
    return true
  }
  return false
}

/** 华北密集区：北京常在屏幕中心，命中框易与营口/东营重叠；对北京用更小框 + 排序时加权，避免「略近北京」抢走点击 */
function isBeijingMarker(m) {
  return m && (m.id === 'beijing' || m.name === '北京')
}

function isBayannurMarker(m) {
  return m && (m.id === 'bayannur' || m.name === '巴彦淖尔')
}

/**
 * 各点位独立缩放命中框（0~1）：北京最小；营口/东营次之；巴彦淖尔、万宁相距远可略大。
 * 目标：点谁出谁，重叠区按「加权距离」判给更近的标牌。
 */
function getHitboxSizeFactor(m) {
  if (!m) return 0.8
  const id = m.id || ''
  if (id === 'beijing' || m.name === '北京') return 0.34
  // 东营/营口：给到中等命中圈，提升可点性
  if (id === 'yingkou-bayuquan' || id === 'dongying') return 0.66
  // 巴彦：显著缩小命中圈，避免抢占东营/营口点击
  if (id === 'bayannur') return 0.42
  if (id === 'wanning') return 0.72
  return 0.75
}

/** 用于排序/最近邻：北京强惩罚，其它点按真实距离比较 */
function pixelDistScoreForPick(m, dSq) {
  // 北京在缩小视图时常位于中心，对其做轻惩罚避免“抢点”
  if (isBeijingMarker(m)) return dSq * 2
  // 巴彦在当前布局下也容易“抢中”东营/营口，增加轻惩罚
  if (isBayannurMarker(m)) return dSq * 2.2
  return dSq
}

/** 相机越远，标牌在屏幕上越小，drillPick 易失败；放大屏幕命中半径 */
function getScreenProximityPickParams() {
  if (!viewer) {
    return { maxPx: 240, halfW: 48, halfH: 28, anchorYOffset: 24 }
  }
  let h = 0
  try {
    const carto = viewer.camera.positionCartographic
    if (carto) h = carto.height
  } catch (e) {
    h = 0
  }
  if (!Number.isFinite(h) || h <= 0) h = 5e6
  // 远视图下标牌在屏幕上更“挤”，命中阈值随相机高度动态变化
  const maxPx = Cesium.Math.clamp(1.1e6 / Math.sqrt(h), 140, 240)
  const boxScale = Cesium.Math.clamp(2.2e6 / h, 1, 1.35)
  return {
    maxPx,
    halfW: 52 * boxScale,
    halfH: 30 * boxScale,
    anchorYOffset: 24
  }
}

async function createBlueMarkerIconDataUrlFromOrange(url) {
  // 未选中态：按设计参数绘制（CSS 等效）
  // width: 100px; height: 30px;
  // background: linear-gradient(93deg, #0B88F9 0%, #34C8FF 100%);
  // box-shadow: 0px 2px 4px 0px rgba(0,82,169,0.5);
  // border-radius: 4px; border: 1px solid #FFFFFF; opacity: 0.77;
  const dpr = 2
  const boxW = 100
  const boxH = 30
  const totalW = boxW
  const arrowH = 18
  // 输出尺寸严格对齐：30（框体）+18（箭头）= 48
  const totalH = boxH + arrowH

  const canvas = document.createElement('canvas')
  canvas.width = totalW * dpr
  canvas.height = totalH * dpr
  const ctx = canvas.getContext('2d')
  if (!ctx) return url

  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, totalW, totalH)

  const opacity = 0.77
  const r = 4
  const x = 0
  const y = 0

  // shadow（注意：不额外留 padding，阴影会在边缘略裁剪，但保证尺寸严格一致）
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.shadowColor = 'rgba(0,82,169,0.5)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 2

  // rounded rect path
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + boxW - r, y)
  ctx.quadraticCurveTo(x + boxW, y, x + boxW, y + r)
  ctx.lineTo(x + boxW, y + boxH - r)
  ctx.quadraticCurveTo(x + boxW, y + boxH, x + boxW - r, y + boxH)
  ctx.lineTo(x + r, y + boxH)
  ctx.quadraticCurveTo(x, y + boxH, x, y + boxH - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()

  // fill gradient (approx 93deg)
  const grad = ctx.createLinearGradient(0, boxH, boxW, 0)
  grad.addColorStop(0, '#0B88F9')
  grad.addColorStop(1, '#34C8FF')
  ctx.fillStyle = grad
  ctx.fill()
  ctx.restore()

  // border
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.lineWidth = 1
  ctx.strokeStyle = '#FFFFFF'
  ctx.stroke()
  ctx.restore()

  // arrow: 复用原图箭头形状，转蓝后贴到底部（风格与选中态一致）
  const arrowInfo = await new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const srcCanvas = document.createElement('canvas')
      srcCanvas.width = img.width
      srcCanvas.height = img.height
      const sctx = srcCanvas.getContext('2d')
      if (!sctx) return resolve(null)
      sctx.drawImage(img, 0, 0)
      const imageData = sctx.getImageData(0, 0, img.width, img.height)
      const data = imageData.data

      // 识别框体 bbox（上半部分）
      const boxYEnd = Math.floor(img.height * 0.58)
      let bMinX = img.width, bMinY = img.height, bMaxX = 0, bMaxY = 0
      let boxFound = false
      for (let yy = 0; yy < boxYEnd; yy++) {
        for (let xx = 0; xx < img.width; xx++) {
          const a = data[(yy * img.width + xx) * 4 + 3]
          if (a > 8) {
            boxFound = true
            if (xx < bMinX) bMinX = xx
            if (yy < bMinY) bMinY = yy
            if (xx > bMaxX) bMaxX = xx
            if (yy > bMaxY) bMaxY = yy
          }
        }
      }
      if (!boxFound) return resolve(null)

      // 识别箭头 bbox（下半部分）
      const arrowYStart = Math.floor(img.height * 0.50)
      let aMinX = img.width, aMinY = img.height, aMaxX = 0, aMaxY = 0
      let arrowFound = false
      for (let yy = arrowYStart; yy < img.height; yy++) {
        for (let xx = 0; xx < img.width; xx++) {
          const a = data[(yy * img.width + xx) * 4 + 3]
          if (a > 8) {
            arrowFound = true
            if (xx < aMinX) aMinX = xx
            if (yy < aMinY) aMinY = yy
            if (xx > aMaxX) aMaxX = xx
            if (yy > aMaxY) aMaxY = yy
          }
        }
      }
      if (!arrowFound) return resolve(null)

      const aw = aMaxX - aMinX + 1
      const ah = aMaxY - aMinY + 1
      const crop = document.createElement('canvas')
      crop.width = aw
      crop.height = ah
      const cctx = crop.getContext('2d')
      if (!cctx) return resolve(null)
      cctx.drawImage(srcCanvas, aMinX, aMinY, aw, ah, 0, 0, aw, ah)

      // 用“原箭头的透明度”做遮罩，用纯蓝渐变重新填充，避免边缘残留橙色导致发紫
      const blue = document.createElement('canvas')
      blue.width = aw
      blue.height = ah
      const bctx = blue.getContext('2d')
      if (!bctx) return resolve(null)
      // 蓝色渐变（与未选中框体一致）
      const agrad = bctx.createLinearGradient(0, ah, aw, 0)
      agrad.addColorStop(0, '#0B88F9')
      agrad.addColorStop(1, '#34C8FF')
      bctx.fillStyle = agrad
      bctx.fillRect(0, 0, aw, ah)
      bctx.globalCompositeOperation = 'destination-in'
      bctx.drawImage(crop, 0, 0)
      bctx.globalCompositeOperation = 'source-over'

      resolve({
        dataUrl: blue.toDataURL('image/png'),
        srcBox: { minX: bMinX, minY: bMinY, maxX: bMaxX, maxY: bMaxY },
        srcArrow: { minX: aMinX, minY: aMinY, maxX: aMaxX, maxY: aMaxY }
      })
    }
    img.onerror = () => resolve(null)
    img.src = url
  })

  if (arrowInfo?.dataUrl) {
    const arrowImg = await new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => resolve(null)
      img.src = arrowInfo.dataUrl
    })
    if (arrowImg) {
      const srcBoxW = arrowInfo.srcBox.maxX - arrowInfo.srcBox.minX + 1
      const srcBoxH = arrowInfo.srcBox.maxY - arrowInfo.srcBox.minY + 1
      const srcBoxCx = (arrowInfo.srcBox.minX + arrowInfo.srcBox.maxX) / 2

      const srcArrowW = arrowInfo.srcArrow.maxX - arrowInfo.srcArrow.minX + 1
      const srcArrowH = arrowInfo.srcArrow.maxY - arrowInfo.srcArrow.minY + 1
      const srcArrowCx = (arrowInfo.srcArrow.minX + arrowInfo.srcArrow.maxX) / 2

      // 同时约束“框体宽度”和“箭头高度”两者都能放进目标画布：
      // - 框体目标宽度 100px
      // - 箭头目标高度 18px（48-30）
      // 这样蓝色箭头的大小/位置会更贴近原图（避免因为只按宽度缩放导致箭头过大溢出）
      const scale = Math.min(boxW / srcBoxW, arrowH / srcArrowH)
      const drawW = srcArrowW * scale
      const drawH = srcArrowH * scale

      // 保持箭头相对框体中心的偏移一致
      const dx = (srcArrowCx - srcBoxCx) * scale
      const ax = boxW / 2 + dx - drawW / 2

      // 保持箭头相对框体底部的间距一致
      const srcGapY = (arrowInfo.srcArrow.minY - arrowInfo.srcBox.maxY) * scale
      let ay = boxH + srcGapY
      // 保证箭头完全落在 [boxH, totalH] 区间内
      if (ay < boxH) ay = boxH
      if (ay + drawH > totalH) ay = totalH - drawH

      ctx.save()
      ctx.globalAlpha = opacity
      ctx.drawImage(arrowImg, ax, ay, drawW, drawH)
      ctx.restore()
    }
  }

  return canvas.toDataURL('image/png')
}

function downloadDataUrl(dataUrl, filename) {
  try {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = filename
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } catch (e) {
    // ignore
  }
}

function setSelectedMarker(m, worldPosition) {
  const nextId = m?.id || m?.name || null
  selectedMarkerId.value = nextId
  selectedMarkerWorld = worldPosition || (m?.lon != null && m?.lat != null ? fromWebMercator(toWebMercator(m.lon, m.lat).x, toWebMercator(m.lon, m.lat).y, 0) : null)

  // 更新所有点位样式（图标蓝/橙）
  markerEntities.forEach((entry) => {
    const payload = entry?.billboardEntity?.popupPayload
    const payloadKey = payload?.id || payload?.name || null
    const isSelected = payloadKey === nextId
    if (entry?.billboardEntity?.billboard) {
      entry.billboardEntity.billboard.image = isSelected ? iconOrangeUrl : iconBlueDataUrl
    }
  })

  selectedBoxVisible.value = Boolean(nextId && selectedMarkerWorld)
  updateSelectedBoxPosition()
  viewer?.scene?.requestRender?.()
}

/**
 * Cesium drillPick 在首次拾取结果缺少 primitive 时会直接中断，可能返回空数组；
 * 用屏幕距离在点位/箭头/标签附近命中，作为可靠回退。
 */
function tryOpenPopupByScreenProximity(clickScreen) {
  const { maxPx, anchorYOffset } = getScreenProximityPickParams()
  const maxSq = maxPx * maxPx
  let bestM = null
  let bestWorld = null
  let bestRawSq = Infinity
  let bestScore = Infinity

  // 用“实体真实渲染位置”做回退命中，避免与原始 lon/lat（未应用微分散）不一致
  for (const [, entry] of markerEntities) {
    const entity = entry?.billboardEntity
    const m = entity?.popupPayload
    if (!entity || !m) continue
    const p0 = entity.position?.getValue?.(viewer.clock.currentTime)
    if (!p0) continue
    const sc = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, p0)
    if (!sc) continue
    const ax = sc.x
    // 多锚点：同一标牌的可点击区域在上下（标牌箭头/中部/标签文字），远距离时单一锚点容易偏差
    const offs = [
      anchorYOffset,
      anchorYOffset - 16,
      anchorYOffset + 10
    ].map((v) => Math.max(0, v))

    let dSq = Infinity
    for (const off of offs) {
      const ay = sc.y - off
      dSq = Math.min(dSq, distSqScreen(clickScreen, { x: ax, y: ay }))
    }

    const markerFactor = getHitboxSizeFactor(m)
    const markerMaxSq = (maxPx * markerFactor) * (maxPx * markerFactor)
    if (dSq > markerMaxSq || dSq > maxSq) continue

    const score = pixelDistScoreForPick(m, dSq)
    if (score < bestScore) {
      bestScore = score
      bestRawSq = dSq
      bestM = m
      bestWorld = p0
    }
  }

  if (bestM != null && bestWorld != null && bestRawSq <= maxSq) {
    openPopup(bestM, bestWorld, clickScreen)
    setSelectedMarker(bestM, bestWorld)
    viewer.scene.requestRender()
    return true
  }

  return false
}

function attachPopupPayload(entity, payload) {
  entity.popupPayload = payload
}

function getMarkerEntityFromPickedObject(picked) {
  if (!Cesium.defined(picked)) return null
  const candidates = [
    picked.id,
    picked.primitive?.id,
    picked.collection?.id,
    picked.primitive?.collection?.id
  ]
  for (const c of candidates) {
    if (c && c.popupPayload) return c
  }
  return null
}

function addChinaBoundary3857() {
  const chinaBoundaryCoords = [
    [73.5, 35.5], [73.5, 39.0], [76.0, 40.0], [80.0, 42.0], [88.0, 43.5],
    [95.0, 42.0], [100.0, 42.0], [105.0, 41.0], [110.0, 42.0], [115.0, 41.0],
    [120.0, 42.0], [125.0, 42.0], [128.0, 42.0], [130.0, 42.0], [132.0, 44.0],
    [134.0, 48.0], [135.0, 50.0], [135.0, 53.0], [130.0, 53.0], [125.0, 53.0],
    [120.0, 50.0], [115.0, 47.0], [110.0, 45.0], [105.0, 42.0], [100.0, 40.0],
    [95.0, 38.0], [90.0, 35.0], [85.0, 30.0], [80.0, 28.0], [75.0, 25.0],
    [73.0, 22.0], [73.0, 20.0], [108.0, 20.0], [110.0, 18.0], [112.0, 18.0],
    [116.0, 20.0], [120.0, 22.0], [122.0, 25.0], [122.0, 28.0], [120.0, 30.0],
    [118.0, 32.0], [116.0, 35.0], [114.0, 37.0], [110.0, 38.0], [105.0, 38.0],
    [100.0, 38.0], [95.0, 38.0], [90.0, 37.0], [85.0, 36.0], [80.0, 36.0],
    [76.0, 36.0], [73.5, 35.5]
  ]
  const flatCoords = chinaBoundaryCoords.flat()
  const wm3857Positions = fromDegreesArrayToWebMercator(flatCoords)

  // 方案二：增强轮廓层次（外发光 + 内实线 + 更明显的浅填充）
  const glowBlue = Cesium.Color.fromCssColorString('#42ACFF').withAlpha(0.95)
  const edgeShadow = Cesium.Color.fromCssColorString('#2E5E8D').withAlpha(0.42)
  const innerWhite = Cesium.Color.WHITE.withAlpha(0.95)

  // 外发光轮廓（最先添加，作为底层光晕）
  viewer.entities.add({
    name: '中国边界-3857-glow',
    polyline: {
      positions: wm3857Positions,
      width: 10,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.25,
        color: glowBlue
      }),
      clampToGround: true
    }
  })

  viewer.entities.add({
    name: '中国边界-3857',
    polyline: {
      positions: wm3857Positions,
      width: 3,
      material: new Cesium.PolylineDashMaterialProperty({
        color: innerWhite,
        dashLength: 8,
        gapColor: Cesium.Color.TRANSPARENT
      }),
      clampToGround: true,
      classificationType: Cesium.ClassificationType.BOTH
    }
  })

  // 内实线（压在虚线上，让轮廓更清晰）
  viewer.entities.add({
    name: '中国边界-3857-solid',
    polyline: {
      positions: wm3857Positions,
      width: 1.6,
      material: innerWhite,
      clampToGround: true
    }
  })

  viewer.entities.add({
    name: '中国区域-3857',
    polygon: {
      hierarchy: new Cesium.PolygonHierarchy(wm3857Positions),
      material: Cesium.Color.fromCssColorString('#EAF6FF').withAlpha(0.32),
      outline: true,
      outlineColor: glowBlue.withAlpha(0.9),
      outlineWidth: 1,
      clampToGround: true
    }
  })
}

async function addChinaBoundaryFromGeoJson() {
  // 公开行政边界数据（WGS84）
  const url = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json'
  const res = await fetch(url)
  if (!res.ok) throw new Error(`china geojson load failed: ${res.status}`)
  const geojson = await res.json()
  const features = Array.isArray(geojson?.features) ? geojson.features : []
  if (!features.length) throw new Error('empty china geojson features')

  const glowBlue = Cesium.Color.fromCssColorString('#42ACFF').withAlpha(0.92)
  const innerWhite = Cesium.Color.WHITE.withAlpha(0.9)
  const provinceLine = Cesium.Color.fromCssColorString('#BDE9FF').withAlpha(0.34)
  // 恢复为最初的白色地图面（不要灰色）
  const fillColor = Cesium.Color.fromCssColorString('#F8FCFF').withAlpha(0.98)
  // 外线阴影降到很弱，仅保留一点立体边缘
  const edgeShadow = Cesium.Color.fromCssColorString('#6F7782').withAlpha(0.1)

  const outerRings = []
  for (const f of features) {
    const rings = geometryToRings(f.geometry)
    for (let i = 0; i < rings.length; i++) {
      const ring = rings[i]
      if (!ring || ring.length < 3) continue
      if (i === 0) outerRings.push(ring)
    }
  }

  // 省界线（细线条）
  for (const f of features) {
    const rings = geometryToRings(f.geometry)
    for (const ring of rings) {
      const positions = ringLonLatToPositions(ring, 0)
      if (positions.length < 2) continue
      viewer.entities.add({
        name: '中国省界线',
        polyline: {
          positions,
          width: 0.85,
          material: provinceLine,
          clampToGround: true
        }
      })
    }
  }

  // 外轮廓：外发光 + 内实线
  for (const ring of outerRings) {
    const positions = ringLonLatToPositions(ring, 0)
    if (positions.length < 2) continue
    // 外侧阴影层：让线条外沿有“瓜一点”的阴影感
    viewer.entities.add({
      name: '中国边界-geo-edgeShadow',
      polyline: {
        positions,
        width: 12,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.12,
          color: edgeShadow
        }),
        clampToGround: true
      }
    })
    viewer.entities.add({
      name: '中国边界-geo-glow',
      polyline: {
        positions,
        width: 7,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.2,
          color: glowBlue
        }),
        clampToGround: true
      }
    })
    viewer.entities.add({
      name: '中国边界-geo-solid',
      polyline: {
        positions,
        width: 1.35,
        material: innerWhite.withAlpha(0.88),
        clampToGround: true
      }
    })
  }

  // 主体层（稳定可见的中国地图面）
  for (const ring of outerRings) {
    const positions = ringLonLatToPositions(ring, 0)
    if (positions.length < 3) continue
    viewer.entities.add({
      name: '中国区域-geo-fill',
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(positions),
        material: fillColor,
        outline: false,
        clampToGround: true
      }
    })
  }
}

/** 与 SingleTileImageryProvider 一致：用于底图拉伸/覆盖映射 */
// 背景图裁剪矩形：必须与背景图的拉伸设计匹配（否则会出现“中间底图不见了”）
// 在保证匹配的前提下，略微加宽，让初始视野缩放时不容易露边。
let IMAGERY_RECT = Cesium.Rectangle.fromDegrees(59, 7, 151, 61)

function computeMarkersBoundsRect(markers, { paddingScale = 1.45 } = {}) {
  let west = Infinity
  let east = -Infinity
  let south = Infinity
  let north = -Infinity
  let count = 0

  for (const m of markers || []) {
    if (!m || m.lon == null || m.lat == null) continue
    const lon = Number(m.lon)
    const lat = Number(m.lat)
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue
    west = Math.min(west, lon)
    east = Math.max(east, lon)
    south = Math.min(south, lat)
    north = Math.max(north, lat)
    count++
  }

  if (count === 0) return Cesium.Rectangle.fromDegrees(59, 7, 151, 61)

  const lonSpan = Math.max(east - west, 0.01)
  const latSpan = Math.max(north - south, 0.01)
  const centerLon = (west + east) / 2
  const centerLat = (south + north) / 2

  const halfLon = (lonSpan * paddingScale) / 2
  const halfLat = (latSpan * paddingScale) / 2

  return Cesium.Rectangle.fromDegrees(
    centerLon - halfLon,
    centerLat - halfLat,
    centerLon + halfLon,
    centerLat + halfLat
  )
}

function updateBaseImageryRectangle(rect) {
  if (!viewer || !rect) return
  IMAGERY_RECT = rect
  viewer.imageryLayers.removeAll()
  const styleBgImagery = new Cesium.SingleTileImageryProvider({
    url: bgImg,
    rectangle: IMAGERY_RECT,
    tileWidth: 2048,
    tileHeight: 2048,
    projection: webMercatorProjection
  })
  viewer.imageryLayers.addImageryProvider(styleBgImagery)
  viewer.scene.requestRender()
}

/** 初始视野：全国居中、五省点位均在框内（接近设计稿整图比例） */
function fitCameraToMarkerBounds(markers) {
  if (!viewer || !markers?.length) return
  // 以 markers 的经纬度外包框为准，给足 padding；底图 rectangle 保持固定，避免界面“奇怪”
  // 再缩小一点，让地图落在两侧虚线之间并保留左右空隙
  const dest = computeMarkersBoundsRect(markers, { paddingScale: 1.72 })
  const baseRect = Cesium.Rectangle.fromDegrees(59, 7, 151, 61)
  const clipped = Cesium.Rectangle.simpleIntersection(dest, baseRect) || dest
  // 若 markers 很少（例如其它点暂时隐藏/占位），避免视野缩得太紧导致“界面不如以前”
  const baseLonSpan = baseRect.east - baseRect.west
  const baseLatSpan = baseRect.north - baseRect.south
  const lonSpan = clipped.east - clipped.west
  const latSpan = clipped.north - clipped.south
  const finalRect =
    lonSpan < baseLonSpan * 0.78 || latSpan < baseLatSpan * 0.78 ? baseRect : clipped

  viewer.camera.setView({ destination: finalRect })
  viewer.scene.requestRender()
}

function addMarkers3857(markers) {
  // 若 markers-popup.json 中出现大量 lon/lat 完全相同的点，会导致标牌重叠、点击/拾取无法区分。
  // 这里对同坐标点做一个很小的环形分散（仅为可点击与弹窗定位服务）。
  const groups = new Map()
  for (const m of markers) {
    const lon = Number(m?.lon)
    const lat = Number(m?.lat)
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue
    const key = `${lon.toFixed(4)}_${lat.toFixed(4)}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(m)
  }

  let duplicateGroupCount = 0
  for (const [, arr] of groups) {
    if (arr.length > 1) duplicateGroupCount++
  }
  if (duplicateGroupCount > 0 && typeof window !== 'undefined') {
    console.warn(`markers-popup.json 存在 ${duplicateGroupCount} 组重复 lon/lat；已做微分散以保证可点击。请尽量修正真实经纬度。`)
  }

  const counters = new Map()

  markers.forEach((m, idx) => {
    const lon0 = Number(m.lon)
    const lat0 = Number(m.lat)
    let lon = lon0
    let lat = lat0

    const key = `${lon0.toFixed(4)}_${lat0.toFixed(4)}`
    const group = groups.get(key) || []
    if (group.length > 1) {
      const j = counters.get(key) || 0
      counters.set(key, j + 1)
      const size = group.length
      const radiusLon = 0.06 / Math.sqrt(size)
      const radiusLat = 0.04 / Math.sqrt(size)
      const angle = (2 * Math.PI * j) / size
      lon = lon0 + radiusLon * Math.cos(angle)
      lat = lat0 + radiusLat * Math.sin(angle)
    }

    const wm = toWebMercator(lon, lat)
    const position = fromWebMercator(wm.x, wm.y, 0)

    // Cesium 的 EntityCollection 要求 entity.id 唯一；
    // markers-popup.json 里可能会出现重复 id（你现在报的 huanghehenanduan 就是）。
    // 为了不让整个 mounted 初始化失败，这里给 Cesium 实体拼一个唯一后缀，但保留 payload 原始 id/name 用于弹窗与选中态。
    const logicalId = m.id || m.name
    const entityId = `${logicalId}__${idx}`

    const rawName = String(m?.name ?? '')
    // 标牌是固定宽度（100px），长标题在标牌上用省略，避免继续出界；
    // 完整标题仍在弹窗内展示。
    const labelText = rawName.length > 8 ? `${rawName.slice(0, 8)}...` : rawName
    const labelWidth = 100
    const billboardEntity = viewer.entities.add({
      id: entityId,
      name: m.name,
      position,
      billboard: {
        image: iconBlueDataUrl,
        width: 100,
        height: 48,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      },
      label: {
        text: labelText,
        font: '16px PingFangSC, PingFang SC, sans-serif',
        fillColor: LABEL_TEXT,
        style: Cesium.LabelStyle.FILL,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -26),
        width: labelWidth,
        height: 30,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    })
    attachPopupPayload(billboardEntity, m)
    markerEntities.set(entityId, { billboardEntity })
  })
}

function setupMarkerInteraction() {
  clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  clickHandler.setInputAction((click) => {
    const screenPos = new Cesium.Cartesian2(click.position.x, click.position.y)
    viewer.scene.requestRender()

    // 先走“最近点”命中：密集点/重叠时比 scene.pick 的第一个命中更稳定
    if (tryOpenPopupByScreenProximity(screenPos)) return

    // 最稳定方案：邻域多点 pick，命中哪个实体就弹哪个
    const offsets = [
      [0, 0], [4, 0], [-4, 0], [0, 4], [0, -4],
      [8, 0], [-8, 0], [0, 8], [0, -8]
    ]
    for (const [dx, dy] of offsets) {
      const p = new Cesium.Cartesian2(click.position.x + dx, click.position.y + dy)
      const picked = viewer.scene.pick(p)
      const entity = getMarkerEntityFromPickedObject(picked)
      if (!entity || !entity.popupPayload) continue
      const m = entity.popupPayload
      let pos = null
      if (entity.position) pos = entity.position.getValue(viewer.clock.currentTime)
      if (!pos && m.lon != null && m.lat != null) {
        const wm = toWebMercator(m.lon, m.lat)
        pos = fromWebMercator(wm.x, wm.y, 0)
      }
      if (!pos) continue
      openPopup(m, pos, screenPos)
      setSelectedMarker(m, pos)
      viewer.scene.requestRender()
      return
    }

    // 邻域 pick + proximity 都失败
    closePopup()
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  postRenderListener = () => {
    if (popupVisible.value && activePopupPosition) {
      updatePopupScreenPosition()
    }
    if (selectedBoxVisible.value && selectedMarkerWorld) {
      updateSelectedBoxPosition()
    }
  }
  viewer.scene.postRender.addEventListener(postRenderListener)

  // DOM 兜底点击：某些环境下 Cesium LEFT_CLICK 不稳定时仍可触发点位弹窗
  const wrapEl = cesiumWrapRef.value
  if (wrapEl && !domClickHandler) {
    domClickHandler = (evt) => {
      if (!viewer || !viewer.scene || !viewer.scene.canvas) return
      const canvas = viewer.scene.canvas
      const rect = canvas.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const ratioX = canvas.width / rect.width
      const ratioY = canvas.height / rect.height
      const x = (evt.clientX - rect.left) * ratioX
      const y = (evt.clientY - rect.top) * ratioY
      const screenPos = new Cesium.Cartesian2(x, y)

      // 先走最近点
      if (tryOpenPopupByScreenProximity(screenPos)) return

      const offsets = [
        [0, 0], [4, 0], [-4, 0], [0, 4], [0, -4],
        [8, 0], [-8, 0], [0, 8], [0, -8]
      ]
      for (const [dx, dy] of offsets) {
        const p = new Cesium.Cartesian2(x + dx, y + dy)
        const picked = viewer.scene.pick(p)
        const entity = getMarkerEntityFromPickedObject(picked)
        if (!entity || !entity.popupPayload) continue
        const m = entity.popupPayload
        let pos = null
        if (entity.position) pos = entity.position.getValue(viewer.clock.currentTime)
        if (!pos && m.lon != null && m.lat != null) {
          const wm = toWebMercator(m.lon, m.lat)
          pos = fromWebMercator(wm.x, wm.y, 0)
        }
        if (!pos) continue
        openPopup(m, pos, screenPos)
        setSelectedMarker(m, pos)
        viewer.scene.requestRender()
        return
      }

      closePopup()
    }
    wrapEl.addEventListener('click', domClickHandler, true)
  }
}

onMounted(async () => {
  try {
    viewer = new Cesium.Viewer(cesiumContainer.value, {
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    vrButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    timeline: false,
    navigationHelpButton: false,
    selectionIndicator: false,
    terrain: undefined,
    mapProjection: webMercatorProjection,
    sceneMode: Cesium.SceneMode.SCENE2D,
    requestRenderMode: true,
    contextOptions: {
      webgl: {
        alpha: false
      }
    }
  })

  const imageryRectangle = Cesium.Rectangle.fromDegrees(59, 7, 151, 61)
  const styleBgImagery = new Cesium.SingleTileImageryProvider({
    url: bgImg,
    rectangle: imageryRectangle,
    tileWidth: 2048,
    tileHeight: 2048,
    projection: webMercatorProjection
  })

  viewer.imageryLayers.removeAll()
  viewer.imageryLayers.addImageryProvider(styleBgImagery)

  // 供叠加层（ECharts 等）获取屏幕坐标使用
  if (typeof window !== 'undefined') {
    window.__airCesiumViewer = viewer
  }

  viewer.scene.screenSpaceCameraController.enableRotate = false
  viewer.scene.screenSpaceCameraController.enableTranslate = true
  viewer.scene.screenSpaceCameraController.enableZoom = true
  viewer.scene.screenSpaceCameraController.enableTilt = false
  viewer.scene.screenSpaceCameraController.enableLook = false
  // 先给较大上限；fitCameraToMarkerBounds 后会基于初始视野再“锁住”最小缩放，避免露出两侧背景边缘
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 120000000
  viewer.scene.screenSpaceCameraController.minimumZoomDistance = 180000

  viewer.cesiumWidget.creditContainer.style.display = 'none'

  // 边界加载不要阻塞点位渲染：网络慢/卡住时会导致 markers 和交互延后甚至不出现
  addChinaBoundaryFromGeoJson()
    .catch((e) => {
      console.warn('china geojson 加载失败/超时，回退到示意边界', e)
      addChinaBoundary3857()
    })

  iconBlueDataUrl = await createBlueMarkerIconDataUrlFromOrange(iconOrangeUrl)
  // 需要导出蓝色 PNG 文件时：URL 加 ?exportBlueIcon=1
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search || '')
    if (params.get('exportBlueIcon') === '1') {
      downloadDataUrl(iconBlueDataUrl, '定位 默认@2x.png')
    }
  }

  let markers = []
  try {
    const res = await fetch('/markers-popup.json')
    if (res.ok) {
      markers = await res.json()
    }
  } catch (e) {
    console.warn('markers-popup.json 加载失败', e)
  }
  const markerExtras = {
    aircraftModel: '',
    flightTime: '',
    payloadType: '',
    missionType: '',
    description: '',
    operationParams: '',
    surfaceFeatures: ''
  }
  if (!markers.length) {
    markers = [
      { id: 'beijing', name: '北京', lon: 116.4074, lat: 39.9042, title: '北京', summary: '', images: [], ...markerExtras },
      { id: 'bayannur', name: '巴彦淖尔', lon: 107.386, lat: 40.751, title: '巴彦淖尔', summary: '', images: [], ...markerExtras },
      { id: 'yingkou-bayuquan', name: '营口鲅鱼圈', lon: 122.235, lat: 40.667, title: '营口鲅鱼圈', summary: '', images: [], ...markerExtras },
      { id: 'dongying', name: '东营数据', lon: 118.505, lat: 37.438, title: '东营数据', summary: '', images: [], ...markerExtras },
      { id: 'wanning', name: '海南万宁', lon: 110.389, lat: 18.799, title: '海南万宁', summary: '', images: [], ...markerExtras }
    ]
  }
  const activeMarkers = markers.filter(isActiveMarker)
  // 防御：如果 json 没取到 id（或暂时为空），至少保证 5 个点能工作
  const safeMarkers =
    activeMarkers.length > 0
      ? activeMarkers
      : [
          { id: 'beijing', name: '北京', lon: 116.4074, lat: 39.9042, title: '北京', summary: '', images: [], ...markerExtras },
          { id: 'bayannur', name: '巴彦淖尔', lon: 107.386, lat: 40.751, title: '巴彦淖尔', summary: '', images: [], ...markerExtras },
          { id: 'yingkou-bayuquan', name: '营口鲅鱼圈', lon: 122.235, lat: 40.667, title: '营口鲅鱼圈', summary: '', images: [], ...markerExtras },
          { id: 'dongying', name: '东营数据', lon: 118.505, lat: 37.438, title: '东营数据', summary: '', images: [], ...markerExtras },
          { id: 'wanning', name: '海南万宁', lon: 110.389, lat: 18.799, title: '海南万宁', summary: '', images: [], ...markerExtras }
        ]

  if (typeof window !== 'undefined') {
    // 方便你在浏览器控制台确认：json 是否加载成功、点位是否被过滤
    console.info('[CesiumViewer]', {
      markersTotal: markers?.length ?? 0,
      activeMarkers: activeMarkers?.length ?? 0,
      safeMarkers: safeMarkers?.length ?? 0
    })
  }

  markersForPick = safeMarkers
  addMarkers3857(safeMarkers)
  fitCameraToMarkerBounds(safeMarkers)

  // 基于初始 fit 结果：把“最远缩放（最大相机高度）”锁死，避免再缩远就露边
  const initH = viewer.camera?.positionCartographic?.height
  if (Number.isFinite(initH) && initH > 0) {
    // 允许极小的进一步缩放，防止“再缩远就露边”
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = initH * 1.1
  }
    setupMarkerInteraction()
  } catch (e) {
    // 避免 mounted hook 未捕获异常导致组件中断；同时把根因打印出来
    console.error('[CesiumViewer] mounted init failed', e)
  }
})

onUnmounted(() => {
  if (viewer && postRenderListener) {
    viewer.scene.postRender.removeEventListener(postRenderListener)
    postRenderListener = null
  }
  if (clickHandler) {
    clickHandler.destroy()
    clickHandler = null
  }
  if (viewer) {
    if (typeof window !== 'undefined' && window.__airCesiumViewer === viewer) {
      delete window.__airCesiumViewer
    }
    viewer.destroy()
    viewer = null
  }
  if (domClickHandler && cesiumWrapRef.value) {
    cesiumWrapRef.value.removeEventListener('click', domClickHandler, true)
    domClickHandler = null
  }
})
</script>

<style scoped>
.cesium-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}

.cesium-container {
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  position: relative;
  z-index: 1;
}

/* 选中态虚线框（对齐标牌图标：100x56，锚点在底部中心） */
.marker-selected-box {
  position: absolute;
  z-index: 1201;
  width: 100px;
  height: 48px;
  transform: translate(-50%, -100%);
  border: 1px dashed #9AB7D5;
  border-radius: 2px;
  box-sizing: border-box;
  pointer-events: none;
  display: none; /* 去掉虚线选中框 */
}

/* 图2：毛玻璃 + 渐变描边；位置由 popupWrapStyle 的 transform 控制 */
.marker-popup {
  position: absolute;
  z-index: 5000;
  width: 446px;
  min-height: 171px;
  max-height: min(420px, 72vh);
  height: auto;
  padding: 8px 10px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px 0 12px 12px;
  border: 1px solid;
  border-image: linear-gradient(225deg, rgba(255, 148, 48, 1), rgba(82, 255, 240, 1), rgba(67, 152, 255, 1)) 1 1;
  box-shadow: 0 6px 24px rgba(40, 90, 140, 0.18);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  pointer-events: auto;
  display: flex;
  flex-direction: column;
}

.marker-popup--right {
  border-radius: 0 12px 12px 12px;
}

.marker-popup--bottom {
  border-radius: 12px;
}

.marker-popup--top {
  border-radius: 12px 12px 0 12px;
}

.marker-popup-close {
  position: absolute;
  top: 4px;
  right: 6px;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  font-size: 20px;
  line-height: 1;
  color: #3f73b1;
  cursor: pointer;
}

.marker-popup-title {
  display: none;
}

.marker-popup-body {
  display: flex;
  flex: 1;
  min-height: 0;
  gap: 10px;
  align-items: stretch;
  overflow: hidden;
}

/* 有配图时：左图右文（接近设计稿） */
.marker-popup-body--row {
  flex-direction: row;
}

.marker-popup-images {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 0 0 120px;
  width: 120px;
  max-height: 100%;
  min-height: 0;
  overflow-y: auto;
}

.marker-popup-img {
  width: 100%;
  height: 74px;
  object-fit: cover;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.marker-popup-text {
  flex: 1;
  min-width: 0;
  width: 308px;
  max-height: 220px;
  height: auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 6px;
  scrollbar-gutter: stable;
  scrollbar-width: thin;            /* Firefox */
  scrollbar-color: rgba(154, 183, 213, 0.9) rgba(255, 255, 255, 0.25);
}

.marker-popup-summary {
  margin: 0;
  font-family: PingFangSC, PingFang SC, sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #515e70;
  line-height: 22px;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-word;
  opacity: 1;
  -webkit-font-smoothing: antialiased;
}

/* WebKit scrollbar（Chrome/Edge） */
.marker-popup-text::-webkit-scrollbar {
  width: 6px;
}
.marker-popup-text::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 6px;
}
.marker-popup-text::-webkit-scrollbar-thumb {
  background: rgba(154, 183, 213, 0.9);
  border-radius: 6px;
}
.marker-popup-text::-webkit-scrollbar-thumb:hover {
  background: rgba(67, 152, 255, 0.95);
}
</style>

<style>
.cesium-scene {
  filter: brightness(1.1) contrast(1.05) !important;
  background: linear-gradient(135deg, #e8f4fd 0%, #d1e7ff 100%) !important;
}
</style>

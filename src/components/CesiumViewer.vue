<template>
  <div class="cesium-wrap">
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
      class="marker-popup"
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
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import bgImg from '@/assets/content/背景.png'

const cesiumContainer = ref(null)
let viewer = null
let clickHandler = null
let postRenderListener = null
let cameraMoveEndListener = null

const ORANGE = Cesium.Color.fromCssColorString('#FF9430')
const BLUE = Cesium.Color.fromCssColorString('#165DFF')
const LABEL_TEXT = Cesium.Color.WHITE

// 选中/未选中图标（未选中蓝色由运行时从橙色图标色相变换得到）
const iconOrangeUrl = '/map/popup/定位 选中@2x.png'
let iconBlueDataUrl = iconOrangeUrl

const popupVisible = ref(false)
const popupData = reactive({
  title: '',
  summary: '',
  images: []
})
const popupScreen = ref({ x: 0, y: 0 })
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

const popupWrapStyle = computed(() => ({
  left: `${popupScreen.value.x}px`,
  top: `${popupScreen.value.y}px`
}))

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

function ringLonLatToPositions(ring) {
  const positions = []
  for (let i = 0; i < ring.length; i++) {
    const p = ring[i]
    if (!Array.isArray(p) || p.length < 2) continue
    const lon = p[0]
    const lat = p[1]
    if (lon == null || lat == null) continue
    const wm = toWebMercator(lon, lat)
    positions.push(fromWebMercator(wm.x, wm.y, 0))
  }
  return positions
}

function updatePopupScreenPosition() {
  if (!viewer || !activePopupPosition) return
  const scene = viewer.scene
  const c = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, activePopupPosition)
  if (c) {
    popupScreen.value = { x: c.x, y: c.y }
  } else if (popupAnchorScreenFallback) {
    popupScreen.value = {
      x: popupAnchorScreenFallback.x,
      y: popupAnchorScreenFallback.y
    }
  }
}

function openPopup(payload, worldPosition, clickScreen) {
  popupData.title = payload.title || payload.name || ''
  popupData.summary = payload.summary || payload.title || payload.name || '暂无详细介绍'
  popupData.images = Array.isArray(payload.images) ? [...payload.images] : []
  activePopupPosition = worldPosition
  popupAnchorScreenFallback =
    clickScreen != null
      ? { x: clickScreen.x, y: clickScreen.y }
      : null
  const c = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, worldPosition)
  if (c) {
    popupScreen.value = { x: c.x, y: c.y }
  } else if (popupAnchorScreenFallback) {
    popupScreen.value = { ...popupAnchorScreenFallback }
  }
  popupVisible.value = true
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
  markerEntities.forEach((entry, id) => {
    const isSelected = id === nextId
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
  const maxPx = 160
  const maxSq = maxPx * maxPx
  let bestM = null
  let bestWorld = null
  let bestD = Infinity

  for (let mi = 0; mi < markersForPick.length; mi++) {
    const m = markersForPick[mi]
    const wm = toWebMercator(m.lon, m.lat)
    const p0 = fromWebMercator(wm.x, wm.y, 0)
    const sc = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, p0)
    if (!sc) continue
    // 先做 hitbox 命中（标牌 100x48，锚点在底部中心）
    const left = sc.x - 52
    const right = sc.x + 52
    const top = sc.y - 52
    const bottom = sc.y + 8
    if (clickScreen.x >= left && clickScreen.x <= right && clickScreen.y >= top && clickScreen.y <= bottom) {
      openPopup(m, p0, clickScreen)
      setSelectedMarker(m, p0)
      viewer.scene.requestRender()
      return true
    }
    // 再退化为中心距离命中
    const d = distSqScreen(clickScreen, { x: sc.x, y: sc.y - 24 })
    if (d < bestD) {
      bestD = d
      bestM = m
      bestWorld = p0
    }
  }

  if (bestM != null && bestWorld != null && bestD <= maxSq) {
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

  const glowBlue = Cesium.Color.fromCssColorString('#42ACFF').withAlpha(0.95)
  const innerWhite = Cesium.Color.WHITE.withAlpha(0.92)
  const provinceLine = Cesium.Color.fromCssColorString('#BDE9FF').withAlpha(0.35)
  const fillColor = Cesium.Color.fromCssColorString('#EAF6FF').withAlpha(0.18)

  const outerRings = []
  const innerRings = []
  for (const f of features) {
    const rings = geometryToRings(f.geometry)
    for (let i = 0; i < rings.length; i++) {
      const ring = rings[i]
      if (!ring || ring.length < 3) continue
      if (i === 0) outerRings.push(ring)
      else innerRings.push(ring)
    }
  }

  // 省界淡线
  for (const f of features) {
    const rings = geometryToRings(f.geometry)
    for (const ring of rings) {
      const positions = ringLonLatToPositions(ring)
      if (positions.length < 2) continue
      viewer.entities.add({
        name: '中国省界线',
        polyline: {
          positions,
          width: 1,
          material: provinceLine,
          clampToGround: true
        }
      })
    }
  }

  // 外轮廓发光 + 实线
  for (const ring of outerRings) {
    const positions = ringLonLatToPositions(ring)
    if (positions.length < 2) continue
    viewer.entities.add({
      name: '中国边界-geo-glow',
      polyline: {
        positions,
        width: 8,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.22,
          color: glowBlue
        }),
        clampToGround: true
      }
    })
    viewer.entities.add({
      name: '中国边界-geo-solid',
      polyline: {
        positions,
        width: 1.6,
        material: innerWhite,
        clampToGround: true
      }
    })
  }

  // 区域浅填充（只填外环）
  for (const ring of outerRings) {
    const positions = ringLonLatToPositions(ring)
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

function addMarkers3857(markers) {
  markers.forEach((m) => {
    const wm = toWebMercator(m.lon, m.lat)
    const position = fromWebMercator(wm.x, wm.y, 0)

    const id = m.id || m.name
    const billboardEntity = viewer.entities.add({
      id,
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
        text: m.name,
        font: '16px PingFangSC, PingFang SC, sans-serif',
        fillColor: LABEL_TEXT,
        style: Cesium.LabelStyle.FILL,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -26),
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    })
    attachPopupPayload(billboardEntity, m)
    markerEntities.set(id, { billboardEntity })
  })
}

function setupMarkerInteraction() {
  clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  clickHandler.setInputAction((click) => {
    const screenPos = new Cesium.Cartesian2(click.position.x, click.position.y)
    viewer.scene.requestRender()

    const picks = viewer.scene.drillPick(click.position, 24)
    for (let i = 0; i < picks.length; i++) {
      const picked = picks[i]
      if (!Cesium.defined(picked) || !picked.id) continue
      const entity = picked.id
      if (!entity.popupPayload) continue
      const m = entity.popupPayload
      let pos = null
      if (entity.position) {
        pos = entity.position.getValue(viewer.clock.currentTime)
      }
      if (!pos && m.lon != null && m.lat != null) {
        const wm = toWebMercator(m.lon, m.lat)
        pos = fromWebMercator(wm.x, wm.y, 0)
      }
      if (pos) {
        openPopup(m, pos, screenPos)
        setSelectedMarker(m, pos)
        viewer.scene.requestRender()
        return
      }
    }
    if (tryOpenPopupByScreenProximity(screenPos)) {
      return
    }
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
}

onMounted(async () => {
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

  const imageryRectangle = Cesium.Rectangle.fromDegrees(60, 8, 150, 60)
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
  // 避免缩得过小看到影像矩形外区域（可按视觉再微调）
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 2900000
  viewer.scene.screenSpaceCameraController.minimumZoomDistance = 350000

  const clampLonLatToImageryRect = () => {
    if (!viewer) return
    const c = viewer.camera.positionCartographic
    if (!c) return
    const lon = Cesium.Math.toDegrees(c.longitude)
    const lat = Cesium.Math.toDegrees(c.latitude)
    const clampedLon = Cesium.Math.clamp(
      lon,
      Cesium.Math.toDegrees(imageryRectangle.west),
      Cesium.Math.toDegrees(imageryRectangle.east)
    )
    const clampedLat = Cesium.Math.clamp(
      lat,
      Cesium.Math.toDegrees(imageryRectangle.south),
      Cesium.Math.toDegrees(imageryRectangle.north)
    )
    if (Math.abs(clampedLon - lon) > 1e-6 || Math.abs(clampedLat - lat) > 1e-6) {
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(clampedLon, clampedLat, c.height)
      })
    }
  }
  cameraMoveEndListener = clampLonLatToImageryRect
  viewer.camera.moveEnd.addEventListener(cameraMoveEndListener)

  const bayannurCoords = { lon: 107.386, lat: 40.751 }
  const bayannur3857 = toWebMercator(bayannurCoords.lon, bayannurCoords.lat)
  viewer.camera.flyTo({
    destination: fromWebMercator(bayannur3857.x, bayannur3857.y, 3000000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0
    },
    duration: 0
  })

  viewer.cesiumWidget.creditContainer.style.display = 'none'

  try {
    await addChinaBoundaryFromGeoJson()
  } catch (e) {
    console.warn('china geojson 加载失败，回退到示意边界', e)
    addChinaBoundary3857()
  }

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
  if (!markers.length) {
    markers = [
      { name: '巴彦淖尔', lon: 107.386, lat: 40.751, title: '巴彦淖尔', summary: '', images: [] },
      { name: '营口鲅鱼圈', lon: 122.235, lat: 40.667, title: '营口鲅鱼圈', summary: '', images: [] },
      { name: '东营数据', lon: 118.505, lat: 37.438, title: '东营数据', summary: '', images: [] },
      { name: '海南万宁', lon: 110.389, lat: 18.799, title: '海南万宁', summary: '', images: [] }
    ]
  }
  markersForPick = markers
  addMarkers3857(markers)
  setupMarkerInteraction()
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
  if (viewer && cameraMoveEndListener) {
    viewer.camera.moveEnd.removeEventListener(cameraMoveEndListener)
    cameraMoveEndListener = null
  }
  if (viewer) {
    if (typeof window !== 'undefined' && window.__airCesiumViewer === viewer) {
      delete window.__airCesiumViewer
    }
    viewer.destroy()
    viewer = null
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
}

/* 弹窗在点位左侧；锚点取右侧中心对齐点位 */
.marker-popup {
  position: absolute;
  z-index: 1200;
  width: 446px;
  height: 171px;
  padding: 8px 10px;
  box-sizing: border-box;
  transform: translate(calc(-100% - 14px), -50%);
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px 0 12px 12px;
  border: 1px solid;
  border-image: linear-gradient(225deg, rgba(255, 148, 48, 1), rgba(82, 255, 240, 1), rgba(67, 152, 255, 1)) 1 1;
  box-shadow: 0 6px 24px rgba(40, 90, 140, 0.18);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  pointer-events: auto;
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
  height: 100%;
  gap: 10px;
  align-items: flex-start;
  overflow: hidden; /* 让内部滚动区生效 */
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
  height: 163px;
  overflow: hidden;
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
  height: 171px;
  overflow-y: auto;
  padding-right: 6px;
  scrollbar-gutter: stable both-edges;
  scrollbar-width: thin;            /* Firefox */
  scrollbar-color: rgba(154, 183, 213, 0.9) rgba(255, 255, 255, 0.25);
}

.marker-popup-summary {
  margin: 0;
  font-family: PingFangSC, PingFang SC, sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #515E70;
  line-height: 22px;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-word;
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

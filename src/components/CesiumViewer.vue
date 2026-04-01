<template>
  <div ref="cesiumContainer" class="cesium-container"></div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import bgImg from '@/assets/content/背景.png'
const cesiumContainer = ref(null)
let viewer = null
// 严格指定EPSG:3857 (Web Mercator) 投影，作为全局坐标系
const webMercatorProjection = new Cesium.WebMercatorProjection()

/**
 * EPSG:3857坐标转Cesium笛卡尔坐标（核心3857适配方法）
 * @param {number} x - 3857横坐标（米）
 * @param {number} y - 3857纵坐标（米）
 * @param {number} height - 高度（米）
 * @returns {Cesium.Cartesian3} 3857坐标系下的笛卡尔坐标
 */
function fromWebMercator(x, y, height = 0) {
  const cartographic = webMercatorProjection.unproject(new Cesium.Cartesian3(x, y, 0))
  return Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height)
}

/**
 * 经纬度转EPSG:3857坐标（用于原始坐标转换）
 * @param {number} lon - 经度
 * @param {number} lat - 纬度
 * @returns {Object} {x, y} 3857平面坐标
 */
function toWebMercator(lon, lat) {
  const cartographic = Cesium.Cartographic.fromDegrees(lon, lat)
  const cartesian = webMercatorProjection.project(cartographic)
  return { x: cartesian.x, y: cartesian.y }
}

/**
 * 经纬度数组批量转3857笛卡尔坐标数组（批量处理边界/面）
 * @param {Array} degreesArray - [lon1, lat1, lon2, lat2, ...]
 * @returns {Array} 3857坐标系下的Cartesian3数组
 */
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

onMounted(() => {
  // 1. 创建新的Cesium Viewer实例，设置EPSG:3857坐标系统，转换为平面地图效果
  viewer = new Cesium.Viewer(cesiumContainer.value, {
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    vrButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: true, // 启用信息框，显示经纬度信息
    sceneModePicker: false,
    timeline: false,
    navigationHelpButton: false,
    selectionIndicator: true, // 启用选择指示器
    terrain: undefined, // 禁用地形，使用平面投影
    mapProjection: webMercatorProjection, // 设置EPSG:3857投影
    sceneMode: Cesium.SceneMode.SCENE2D, // 切换为2D平面模式
    requestRenderMode: true,
    contextOptions: {
      webgl: {
        alpha: false
      }
    }
  })

  // 2. 配置图片作为底图
  const styleBgImagery = new Cesium.SingleTileImageryProvider({
    url: bgImg,
    rectangle: Cesium.Rectangle.fromDegrees(73, 18, 135, 54), // 中国区域范围
    tileWidth: 2048,
    tileHeight: 2048,
    projection: webMercatorProjection // 显式指定3857投影
  })
  
  // 移除默认底图并添加自定义底图
  viewer.imageryLayers.removeAll()
  viewer.imageryLayers.addImageryProvider(styleBgImagery)

  // 3. 启用2D平面模式下的基本交互功能
  viewer.scene.screenSpaceCameraController.enableRotate = false // 2D模式禁用旋转
  viewer.scene.screenSpaceCameraController.enableTranslate = true // 启用平移
  viewer.scene.screenSpaceCameraController.enableZoom = true // 启用缩放
  viewer.scene.screenSpaceCameraController.enableTilt = false // 2D模式禁用倾斜
  viewer.scene.screenSpaceCameraController.enableLook = false // 2D模式禁用视角调整

  // 4. 设置初始视角为巴彦淖尔地区，确保平面地图完整清晰显示
  // 巴彦淖尔坐标：经度107.386°E，纬度40.751°N
  const bayannurCoords = { lon: 107.386, lat: 40.751 }
  const bayannur3857 = toWebMercator(bayannurCoords.lon, bayannurCoords.lat)
  
  // 在2D平面模式下，设置合适的缩放级别和视角
  viewer.camera.flyTo({
    destination: fromWebMercator(bayannur3857.x, bayannur3857.y, 3000000), // 设置合适的缩放级别
    orientation: {
      heading: Cesium.Math.toRadians(0), // 默认正向
      pitch: Cesium.Math.toRadians(-90), // 2D模式下设置为垂直向下视角
      roll: 0
    },
    duration: 0
  })

  // 5. 隐藏版权信息
  viewer.cesiumWidget.creditContainer.style.display = 'none'

  // 6. 添加3857坐标系下的中国边界+区域填充
  addChinaBoundary3857()
  // 7. 添加3857坐标系下的marker点位+文字
  addMarkers3857()
  
  console.log('Cesium场景初始化成功，EPSG:3857坐标系统已设置')
})

onUnmounted(() => {
  // 销毁资源，防止内存泄漏
  if (viewer) {
    viewer.destroy()
    viewer = null
  }
})

/**
 * 核心方法：EPSG:3857坐标系下添加中国边界+区域填充
 * 所有要素统一转换为3857坐标，彻底避免坐标系偏移
 */
function addChinaBoundary3857() {
  // 中国边界原始经纬度轮廓
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
  // 关键：将原始经纬度转为EPSG:3857笛卡尔坐标数组
  const flatCoords = chinaBoundaryCoords.flat()
  const wm3857Positions = fromDegreesArrayToWebMercator(flatCoords)

  // 1. 添加3857坐标系下的中国边界虚线
  viewer.entities.add({
    name: '中国边界-3857',
    polyline: {
      positions: wm3857Positions,
      width: 3,
      material: new Cesium.PolylineDashMaterialProperty({
        color: Cesium.Color.WHITE,
        dashLength: 8,
        gapColor: Cesium.Color.TRANSPARENT
      }),
      clampToGround: true,
      classificationType: Cesium.ClassificationType.BOTH
    }
  })

  // 2. 添加3857坐标系下的中国区域填充
  viewer.entities.add({
    name: '中国区域-3857',
    polygon: {
      hierarchy: new Cesium.PolygonHierarchy(wm3857Positions),
      material: Cesium.Color.WHITE.withAlpha(0.08),
      outline: true,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 1,
      clampToGround: true
    }
  })
  console.log('3857坐标系中国边界及区域添加完成')
}

/**
 * 添加 marker 点位（EPSG:3857 统一渲染）
 * 说明：marker 输入使用 WGS84 的 lon/lat，内部会转换为 EPSG:3857 -> Cesium Cartesian3
 */
function addMarkers3857() {
  const markers = [
    // 近似坐标（WGS84），用于在中国轮廓底图上落点展示
    { name: '巴彦淖尔', lon: 107.386, lat: 40.751 },
    { name: '营口鲅鱼圈', lon: 122.235, lat: 40.667 },
    { name: '东营数据', lon: 118.505, lat: 37.438 },
    { name: '海南万宁', lon: 110.389, lat: 18.799 }
  ]

  const labelBg = Cesium.Color.fromCssColorString('#165DFF').withAlpha(0.92)
  const labelText = Cesium.Color.WHITE
  const arrowColor = Cesium.Color.fromCssColorString('#165DFF')

  markers.forEach((m) => {
    const wm = toWebMercator(m.lon, m.lat)
    const position = fromWebMercator(wm.x, wm.y, 0)

    // 添加箭头
    const arrowPositions = [
      position,
      fromWebMercator(wm.x, wm.y - 50000, 0)
    ]

    viewer.entities.add({
      name: m.name + '-arrow',
      polyline: {
        positions: arrowPositions,
        width: 3,
        material: arrowColor,
        clampToGround: true
      }
    })

    viewer.entities.add({
      name: m.name,
      position,
      point: {
        pixelSize: 8,
        color: Cesium.Color.WHITE,
        outlineColor: arrowColor,
        outlineWidth: 2
      },
      label: {
        text: m.name,
        font: '16px sans-serif',
        fillColor: labelText,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        outlineColor: arrowColor,
        showBackground: true,
        backgroundColor: labelBg,
        backgroundPadding: new Cesium.Cartesian2(12, 8),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -20)
      }
    })
  })

  console.log('3857坐标系marker添加完成')
}
</script>

<!-- 修复样式深层选择器+500错误，适配Vue3 scoped -->
<style scoped>
.cesium-container {
  width: 100%;
  height: 100%; /* height: 100vh;改为全屏高度，避免容器高度为0 */
  background: #f5f7fa;
  position: relative;
  z-index: 1;
}

/* 移除:deep避免热更新样式加载错误，全局样式单独写 */
</style>

<!-- 全局样式处理Cesium场景，避免scoped影响 -->
<style>
.cesium-scene {
  filter: brightness(1.1) contrast(1.05) !important;
  background: linear-gradient(135deg, #e8f4fd 0%, #d1e7ff 100%) !important;
}
</style>
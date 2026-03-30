import * as Cesium from 'cesium'

/**
 * Cesium 工具函数集合
 * 支持 EPSG:3857 (Web Mercator) 坐标系
 */

// Web Mercator 投影实例
const webMercatorProjection = new Cesium.WebMercatorProjection()

/**
 * 将 EPSG:3857 (Web Mercator) 坐标转换为 Cartesian3
 * @param {number} x - Web Mercator X (米)
 * @param {number} y - Web Mercator Y (米)
 * @param {number} height - 高度（米）
 * @returns {Cesium.Cartesian3} 笛卡尔坐标
 */
export function fromWebMercator(x, y, height = 0) {
  const cartographic = webMercatorProjection.unproject(new Cesium.Cartesian3(x, y, 0))
  return Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height)
}

/**
 * 将经纬度转换为 EPSG:3857 (Web Mercator) 坐标
 * @param {number} lon - 经度
 * @param {number} lat - 纬度
 * @returns {Object} {x, y} Web Mercator 坐标（米）
 */
export function toWebMercator(lon, lat) {
  const cartographic = Cesium.Cartographic.fromDegrees(lon, lat)
  const cartesian = webMercatorProjection.project(cartographic)
  return { x: cartesian.x, y: cartesian.y }
}

/**
 * 将经纬度数组转换为 Web Mercator Cartesian3 数组
 * @param {Array} degreesArray - [lon1, lat1, lon2, lat2, ...]
 * @returns {Array} Cartesian3 数组
 */
export function fromDegreesArrayToWebMercator(degreesArray) {
  const result = []
  for (let i = 0; i < degreesArray.length; i += 2) {
    const lon = degreesArray[i]
    const lat = degreesArray[i + 1]
    const wm = toWebMercator(lon, lat)
    result.push(fromWebMercator(wm.x, wm.y))
  }
  return result
}

/**
 * 创建点实体（支持 Web Mercator）
 * @param {string} name - 实体名称
 * @param {number} lon - 经度
 * @param {number} lat - 纬度
 * @param {Object} options - 配置选项
 * @param {boolean} options.useWebMercator - 是否使用 Web Mercator 坐标系（默认 true）
 */
export function createPointEntity(name, lon, lat, options = {}) {
  const {
    color = Cesium.Color.RED,
    pixelSize = 10,
    outlineColor = Cesium.Color.WHITE,
    outlineWidth = 2,
    showLabel = true,
    labelText = name,
    labelColor = Cesium.Color.YELLOW,
    useWebMercator = true
  } = options

  const position = useWebMercator 
    ? fromWebMercator(toWebMercator(lon, lat).x, toWebMercator(lon, lat).y)
    : Cesium.Cartesian3.fromDegrees(lon, lat)

  return {
    name,
    position,
    point: {
      pixelSize,
      color,
      outlineColor,
      outlineWidth
    },
    label: showLabel ? {
      text: labelText,
      font: '14pt sans-serif',
      fillColor: labelColor,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -10)
    } : undefined
  }
}

/**
 * 创建线实体（支持 Web Mercator）
 * @param {string} name - 实体名称
 * @param {Array} positions - 经纬度数组 [lon1, lat1, lon2, lat2, ...]
 * @param {Object} options - 配置选项
 * @param {boolean} options.useWebMercator - 是否使用 Web Mercator 坐标系（默认 true）
 */
export function createPolylineEntity(name, positions, options = {}) {
  const {
    width = 3,
    material = Cesium.Color.YELLOW,
    clampToGround = true,
    useWebMercator = true
  } = options

  const cartesianPositions = useWebMercator
    ? fromDegreesArrayToWebMercator(positions)
    : Cesium.Cartesian3.fromDegreesArray(positions)

  return {
    name,
    polyline: {
      positions: cartesianPositions,
      width,
      material,
      clampToGround
    }
  }
}

/**
 * 创建多边形实体（支持 Web Mercator）
 * @param {string} name - 实体名称
 * @param {Array} positions - 经纬度数组
 * @param {Object} options - 配置选项
 * @param {boolean} options.useWebMercator - 是否使用 Web Mercator 坐标系（默认 true）
 */
export function createPolygonEntity(name, positions, options = {}) {
  const {
    material = Cesium.Color.GREEN.withAlpha(0.3),
    outline = true,
    outlineColor = Cesium.Color.GREEN,
    outlineWidth = 2,
    useWebMercator = true
  } = options

  const cartesianPositions = useWebMercator
    ? fromDegreesArrayToWebMercator(positions)
    : Cesium.Cartesian3.fromDegreesArray(positions)

  return {
    name,
    polygon: {
      hierarchy: cartesianPositions,
      material,
      outline,
      outlineColor,
      outlineWidth
    }
  }
}

/**
 * 飞行到指定位置（支持 Web Mercator）
 * @param {Object} viewer - Cesium viewer 实例
 * @param {number} lon - 经度
 * @param {number} lat - 纬度
 * @param {number} height - 高度
 * @param {number} duration - 飞行时间（秒）
 * @param {boolean} useWebMercator - 是否使用 Web Mercator 坐标系（默认 true）
 */
export function flyTo(viewer, lon, lat, height = 1000000, duration = 2, useWebMercator = true) {
  const destination = useWebMercator
    ? fromWebMercator(toWebMercator(lon, lat).x, toWebMercator(lon, lat).y, height)
    : Cesium.Cartesian3.fromDegrees(lon, lat, height)

  viewer.camera.flyTo({
    destination,
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0.0
    },
    duration
  })
}

/**
 * 获取当前视角信息（包含 Web Mercator 坐标）
 * @param {Object} viewer - Cesium viewer 实例
 */
export function getCameraInfo(viewer) {
  const camera = viewer.camera
  const position = camera.positionCartographic
  const lon = Cesium.Math.toDegrees(position.longitude)
  const lat = Cesium.Math.toDegrees(position.latitude)
  const webMercator = toWebMercator(lon, lat)
  
  return {
    longitude: lon,
    latitude: lat,
    webMercatorX: webMercator.x,
    webMercatorY: webMercator.y,
    height: position.height,
    heading: Cesium.Math.toDegrees(camera.heading),
    pitch: Cesium.Math.toDegrees(camera.pitch),
    roll: Cesium.Math.toDegrees(camera.roll)
  }
}

/**
 * 添加点击事件监听（包含 Web Mercator 坐标）
 * @param {Object} viewer - Cesium viewer 实例
 * @param {Function} callback - 回调函数
 */
export function addClickHandler(viewer, callback) {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
  
  handler.setInputAction((click) => {
    const pickedObject = viewer.scene.pick(click.position)
    const cartesian = viewer.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid)
    
    if (cartesian) {
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      const lon = Cesium.Math.toDegrees(cartographic.longitude)
      const lat = Cesium.Math.toDegrees(cartographic.latitude)
      const webMercator = toWebMercator(lon, lat)
      
      callback({
        position: { 
          lon, 
          lat,
          webMercatorX: webMercator.x,
          webMercatorY: webMercator.y
        },
        pickedObject,
        cartesian
      })
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  
  return handler
}

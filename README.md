# Air Frontend

基于 Vue3 + Vite + JavaScript + Cesium 的 3D 地球可视化项目。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Cesium** - 开源 3D 地球和地图可视化库
- **vite-plugin-cesium** - Vite Cesium 集成插件

## 项目结构

```
air-frontend/
├── public/                 # 静态资源
├── src/
│   ├── components/         # Vue 组件
│   │   └── CesiumViewer.vue    # Cesium 地球组件
│   ├── utils/              # 工具函数
│   │   └── cesiumHelper.js     # Cesium 辅助函数
│   ├── App.vue             # 根组件
│   ├── main.js             # 入口文件
│   └── style.css           # 全局样式
├── index.html              # HTML 入口
├── package.json            # 项目配置
├── vite.config.js          # Vite 配置
└── README.md               # 项目说明
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 启动。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 预览生产构建

```bash
npm run preview
```

## Cesium 功能

项目已集成以下 Cesium 功能：

- 3D 地球渲染
- 地形显示
- 底图选择器
- 地理编码搜索
- 全屏模式
- 场景模式切换（3D/2D/Columbus View）
- 实体绘制（点、线、多边形）
- 相机控制

## 使用 Cesium Ion 服务（可选）

如果需要使用 Cesium Ion 提供的高质量地形、影像等服务：

1. 访问 [Cesium Ion](https://ion.cesium.com/) 注册账号
2. 创建 Access Token
3. 在 `src/components/CesiumViewer.vue` 中设置 token：

```javascript
Cesium.Ion.defaultAccessToken = 'your_cesium_ion_token'
```

## 开发指南

### 添加实体

使用 `cesiumHelper.js` 中的工具函数：

```javascript
import { createPointEntity, createPolylineEntity } from '@/utils/cesiumHelper'

// 添加点
const point = viewer.entities.add(createPointEntity('北京', 116.4074, 39.9042))

// 添加线
const line = viewer.entities.add(createPolylineEntity('路线', [116.4074, 39.9042, 121.4737, 31.2304]))
```

### 相机控制

```javascript
import { flyTo, getCameraInfo } from '@/utils/cesiumHelper'

// 飞行到指定位置
flyTo(viewer, 116.4074, 39.9042, 1000000, 2)

// 获取当前视角
const info = getCameraInfo(viewer)
console.log(info)
```

### 点击事件

```javascript
import { addClickHandler } from '@/utils/cesiumHelper'

// 添加点击监听
const handler = addClickHandler(viewer, (event) => {
  console.log('点击位置:', event.position)
  console.log('选中对象:', event.pickedObject)
})
```

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 许可证

MIT

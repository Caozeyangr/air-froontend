# Project Memory

## 项目基本信息
- 框架：Vue3 + Vite + JavaScript + Cesium
- 坐标系：EPSG:3857 (Web Mercator)
- 项目路径：E:\2Aproject\新建文件夹\air-froontend

## 组件结构
- `src/App.vue` - 根组件，含顶部标题栏（绝对定位，顶部悬浮）
- `src/components/CesiumViewer.vue` - Cesium 地球主视图
- `src/components/leftPanel/index.vue` - 左侧面板（含背景图 左边.png，距左边界 22px，top: 100px，bottom: 0）
- `src/components/leftPanel/SampleLibraryCard.vue` - 智能解译样本库卡片（含翻牌器，从0开始每5s增长10到200）
- `src/components/leftPanel/SampleLibraryStats.vue` - 智能解译样本库统计（弹幕效果，词条来自 /tags.json）
- `src/components/leftPanel/ResourceStats.vue` - 资源统计（ECharts 渐变进度条：GPU/CPU/内存）
- `src/components/rightPanel/index.vue` - 右侧面板（含背景图 右边.png，距右边界 22px，top: 100px，bottom: 0）

## 设计规范
- 标题栏统一样式：`width: 388px; height: 32px; background: linear-gradient(90deg, #42ACFF 0%, rgba(211,235,255,0) 100%); 无圆角; 左对齐`
- 左右面板距边界：22px
- 顶部标题栏高度：~80px（header），面板从 top: 100px 开始

## 已安装依赖
- echarts（用于资源统计图表）
- @zip.js/zip.js 兼容性问题已通过 vite.config.js alias 解决

## assets 资源
- 顶部标题栏.png - 顶部导航栏背景
- 左边.png - 左侧面板背景
- 右边.png - 右侧面板背景
- 底座2.png - 弹幕区底座
- 智能解译样本库底座.png - 样本库卡片底座
- 上箭头.png - 样本库卡片装饰箭头

<template>
  <div class="agent-management-page">
    <!-- 左侧区域 -->
    <div class="left-section">
      <!-- 顶部统计卡片 -->
      <div class="row-top">
        <div class="stat-card">
          <div class="stat-content">
            <div class="stat-label">总对话</div>
            <div class="stat-value">25,431</div>
          </div>
          <div class="stat-chart" ref="chartTotal"></div>
        </div>
        <div class="stat-card">
          <div class="stat-content">
            <div class="stat-label">实时用户</div>
            <div class="stat-value">33</div>
          </div>
          <div class="stat-chart" ref="chartRealtime"></div>
        </div>
      </div>
      <!-- 中间内容卡片 -->
      <div class="row-middle">
        <div class="content-card card-large">
          <div class="card-title">收藏模版库数量</div>
          <div ref="chartContainer" class="bar-chart"></div>
        </div>
        <div class="content-card card-large">
          <div class="card-title">各类知识库调用数量</div>
          <div ref="chartKnowledge" class="pie-chart"></div>
        </div>
      </div>
      <!-- 底部卡片 -->
      <div class="row-bottom">
        <div class="content-card card-template">
          <div class="card-title">收藏模版对话框</div>
          <div class="template-list">
            <div v-for="(item, index) in templateList" :key="index" class="template-item">
              <img :src="listTop" class="template-icon" />
              <el-tooltip :disabled="!isTextOverflow(item.name, 30)" :content="item.name" placement="top">
                <div class="template-name">{{ item.name }}</div>
              </el-tooltip>
              <div class="template-date">{{ item.date }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 中间区域 -->
    <div class="middle-section">
      <div class="card-knowledge">
        <div class="card-title">核心问题 & 知识图谱</div>
      </div>
      <div class="card-user-record">
        <div class="card-title">用户记录</div>
        <div class="user-record-list">
          <div class="record-header">
            <div class="header-item col-username">用户名</div>
            <div class="header-item col-time">时间</div>
            <div class="header-item col-status">状态</div>
            <div class="header-item col-action">操作</div>
          </div>
          <div class="record-content">
            <div v-for="(item, index) in userRecordList" :key="index" class="record-row">
              <div class="record-item col-username">{{ item.username }}</div>
              <div class="record-item col-time">{{ item.time }}</div>
              <div class="record-item col-status">{{ item.status }}</div>
              <div class="record-item col-action action">{{ item.action }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 右侧区域 -->
    <div class="right-section">
      <div class="card-realtime">
        <div class="card-title">实时问题流</div>
        <div class="realtime-list">
          <div v-for="(item, index) in realtimeList" :key="index" class="realtime-item">
            <div class="user-name">{{ item.name }}</div>
            <div class="question-box">{{ item.question }}</div>
            <div class="keywords">
              <span v-for="(keyword, idx) in item.keywords" :key="idx" class="keyword-tag">{{ keyword }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import listTop from '@/assets/sampleStatistics/list-top.png'

// 图表容器引用
const chartTotal = ref(null)        // 总对话趋势图
const chartRealtime = ref(null)     // 实时用户柱状图
const chartContainer = ref(null)    // 收藏模版库数量柱状图
const chartKnowledge = ref(null)    // 各类知识库调用数量饼图

// 各类知识库调用数量数据
const knowledgeData = [
  { name: '80分以下', value: 2, unit: '家' },
  { name: '80-90分', value: 12, unit: '家' },
  { name: '90分以上', value: 14, unit: '家' }
]

// 总对话趋势数据
const CHART_DATA = [233, 0, 0, 333, 543, 546, 765, 444, 225, 664, 775, 886]
// 实时用户数据

// 收藏模版库数量数据
const xData = ['解译', '后处理', '预处理', '分析', '统计']
const barData = [444,333, 666, 462, 377]

// 用户记录数据
const userRecordList = [
  { username: '张三', time: '2026-04-23 15:40:54', status: '已完成', action: 'XXXXXXXX' },
  { username: '张三', time: '2026-04-23 15:40:54', status: '已完成', action: 'XXXXXXXX' },
  { username: '张三', time: '2026-04-23 15:40:54', status: '已完成', action: 'XXXXXXXX' },
  { username: '张三', time: '2026-04-23 15:40:54', status: '已完成', action: 'XXXXXXXX' },
  { username: '张三', time: '2026-04-23 15:40:54', status: '已完成', action: 'XXXXXXXX' },
  { username: '张三', time: '2026-04-23 15:40:54', status: '已完成', action: 'XXXXXXXX' },
  { username: '张三', time: '2026-04-23 15:40:54', status: '已完成', action: 'XXXXXXXX' },
  { username: '张三', time: '2026-04-23 15:40:54', status: '已完成', action: 'XXXXXXXX' },
  { username: '张三', time: '2026-04-23 15:40:54', status: '已完成', action: 'XXXXXXXX' },
  { username: '张三', time: '2026-04-23 15:40:54', status: '已完成', action: 'XXXXXXXX' },
  { username: '张三', time: '2026-04-23 15:40:54', status: '已完成', action: 'XXXXXXXX' },
  { username: '张三', time: '2026-04-23 15:40:54', status: '已完成', action: 'XXXXXXXX' },
  { username: '张三', time: '2026-04-23 15:40:54', status: '已完成', action: 'XXXXXXXX' },
  { username: '张三', time: '2026-04-23 15:40:54', status: '已完成', action: 'XXXXXXXX' },
  { username: '张三', time: '2026-04-23 15:40:54', status: '已完成', action: 'XXXXXXXX' },
  { username: '张三', time: '2026-04-23 15:40:54', status: '已完成', action: 'XXXXXXXX' },
  { username: '张三', time: '2026-04-23 15:40:54', status: '已完成', action: 'XXXXXXXX' },
  { username: '张三', time: '2026-04-23 15:40:54', status: '已完成', action: 'XXXXXXXX' },
  { username: '张三', time: '2026-04-23 15:40:54', status: '已完成', action: 'XXXXXXXX' }
]

// 实时问题流数据
const realtimeList = [
  { name: '张三', question: '我想对东营航飞数据提取风机', keywords: ['解译', '东营'] },
  { name: '李四', question: '我想对这个矢量量进行后处理', keywords: ['后处理', '矢量'] },
  { name: '张三', question: '我想对东营航飞数据提取风机', keywords: ['解译', '东营'] },
  { name: '李四', question: '我想对这个矢量量进行后处理', keywords: ['后处理', '矢量'] },
  { name: '张三', question: '我想对东营航飞数据提取风机', keywords: ['解译', '东营'] },
  { name: '李四', question: '我想对这个矢量量进行后处理', keywords: ['后处理', '矢量'] },
  { name: '张三', question: '我想对东营航飞数据提取风机', keywords: ['解译', '东营'] },
  { name: '李四', question: '我想对这个矢量量进行后处理', keywords: ['后处理', '矢量'] },
  { name: '张三', question: '我想对东营航飞数据提取风机', keywords: ['解译', '东营'] },
  { name: '李四', question: '我想对这个矢量量进行后处理', keywords: ['后处理', '矢量'] },
  { name: '张三', question: '我想对东营航飞数据提取风机', keywords: ['解译', '东营'] },
  { name: '李四', question: '我想对这个矢量量进行后处理', keywords: ['后处理', '矢量'] },
]

// 收藏模板数据
const templateList = [
  { name: '风机解译模板风机解译模板风机解译模板风机解译模板', date: '2026-04-24' },
  { name: '矢量后处理模板矢量后处理模板矢量后处理模板矢量后处理模板矢量后处理模板', date: '2026-04-24' },
  { name: '风机解译模板风机解译模板风机解译模板风机解译模板', date: '2026-04-24' },
  { name: '矢量后处理模板矢量后处理模板矢量后处理模板矢量后处理模板矢量后处理模板', date: '2026-04-24' },
  { name: '风机解译模板风机解译模板风机解译模板风机解译模板', date: '2026-04-24' },
  { name: '矢量后处理模板矢量后处理模板矢量后处理模板矢量后处理模板矢量后处理模板', date: '2026-04-24' },
  { name: '风机解译模板风机解译模板风机解译模板风机解译模板', date: '2026-04-24' },
  { name: '矢量后处理模板矢量后处理模板矢量后处理模板矢量后处理模板矢量后处理模板', date: '2026-04-24' },
  { name: '风机解译模板风机解译模板风机解译模板风机解译模板', date: '2026-04-24' },
  { name: '风机解译模板风机解译模板风机解译模板风机解译模板', date: '2026-04-24' },
  { name: '风机解译模板风机解译模板风机解译模板风机解译模板', date: '2026-04-24' },
  { name: '风机解译模板风机解译模板风机解译模板风机解译模板', date: '2026-04-24' },
  { name: '风机解译模板风机解译模板风机解译模板风机解译模板', date: '2026-04-24' },
  { name: '风机解译模板风机解译模板风机解译模板风机解译模板', date: '2026-04-24' }
]

// 判断文本是否超出指定字数
const isTextOverflow = (text, maxLength) => {
  return text && text.length > maxLength
}

/**
 * 总对话趋势
 */
const getMiniChartOption = () => {
  const data = CHART_DATA.map((value, index) => {
    if (index === CHART_DATA.length - 1) {
      return {
        value: value,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#2697FF' }
      }
    }
    return value
  })
  
  return {
    tooltip: {
      trigger: 'axis',
      showContent: false,
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#A0A4B0',
          width: 1
        }
      }
    },
    grid: {
      left: 0,
      right: 0,
      top: 5,
      bottom: 5,
      containLabel: false
    },
    xAxis: {
      type: 'category',
      show: false,
      boundaryGap: false,
      data: CHART_DATA.map((_, i) => i)
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: [{
      type: 'line',
      smooth: true,
      showSymbol: false,
      symbol: 'circle',
      symbolSize: 6,
      data: data,
      lineStyle: {
        color: '#2697FF',
        width: 2
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(38,151,255,0.3)' },
          { offset: 1, color: 'rgba(38,151,255,0)' }
        ])
      },
      emphasis: {
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#2697FF'
        }
      }
    }]
  }
}

/**
 * 获取柱状图配置（实时用户）
 */
const getBarChartOption = () => {
  const gradientColors = ['#32E1FB', '#017CFF']
  const barData = [233, 111, 233, 333, 543, 546, 765, 775, 886]
  
  return {
    backgroundColor: 'transparent',
    grid: {
      left: 0,
      right: 0,
      top: 5,
      bottom: 5,
      containLabel: false
    },
    xAxis: {
      type: 'category',
      show: false,
      data: barData.map((_, i) => i)
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: [{
      type: 'bar',
      barWidth: 6,
      itemStyle: {
        borderRadius: [3, 3, 3, 3],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: gradientColors[0] },
          { offset: 1, color: gradientColors[1] }
        ])
      },
      data: barData
    }]
  }
}

/**
 * 获取各类知识库调用数量饼图配置
 */
const getKnowledgeOption = () => {
  const color = ['#FFC438', '#01CBCF', '#128DFE']
  
  let sum = 0
  const pieSeries = []
  
  knowledgeData.forEach(v => {
    sum += v.value
  })
  
  knowledgeData.forEach((v, i) => {
    pieSeries.push({
      name: '评价',
      type: 'pie',
      clockWise: false,
      hoverAnimation: false,
      radius: [89 - i * 23 + '%', 74 - i * 23 + '%'],
      center: ['53%', '50%'],
      label: { show: false },
      data: [
        { value: v.value, name: v.name },
        { value: sum - v.value, name: '', itemStyle: { color: 'rgba(0,0,0,0)' } }
      ]
    })
    
    pieSeries.push({
      name: '',
      type: 'pie',
      silent: true,
      z: 1,
      clockWise: false,
      hoverAnimation: false,
      radius: [89 - i * 23 + '%', 74 - i * 23 + '%'],
      center: ['53%', '50%'],
      label: { show: false },
      data: [
        { value: 7.5, itemStyle: { color: '#E3F0FF' } },
        { value: 2.5, name: '', itemStyle: { color: 'rgba(0,0,0,0)' } }
      ]
    })
  })
  
  const richStyle = {
    name: { color: '#666', fontSize: 12 },
    value: { color: '#333', fontSize: 12, fontWeight: 'bold', padding: [0, 0, 0, 8] }
  }
  
  knowledgeData.forEach((_, i) => {
    richStyle['circle' + i] = {
      color: color[i],
      padding: [0, 8]
    }
  })
  
  return {
    grid: {
      top: '10%',
      bottom: '50%',
      left: '50%',
      right: '5%',
      containLabel: false
    },
    backgroundColor: '#fff',
    color: color,
    yAxis: [{
      type: 'category',
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        top: '25%',
        padding: [0, 0, 50, 5],
        formatter: params => {
          const item = knowledgeData[params]
          return '{circle' + params + '|●}{name|' + item.name + '}{value|' + item.value + '家}'
        },
        interval: 0,
        inside: true,
        textStyle: {
          color: '#333',
          fontSize: 14,
          rich: richStyle
        },
        show: true
      },
      data: knowledgeData.map((_, i) => i)
    }],
    xAxis: [{ show: false }],
    series: pieSeries
  }
}

/**
 * 获取收藏模版库数量柱状图配置
 */
const getOption = () => {
  return {
    backgroundColor: 'rgb(255, 255, 255)',
    grid: {
      top: '14%',
      left: '3%',
      bottom: '5%',
      right: '3%',
      containLabel: true
    },
    tooltip: {
      trigger: 'item'
    },
    animation: true,
    xAxis: [{
      show: true,
      type: 'category',
      data: xData,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        textStyle: {
          fontFamily: 'PingFangSC, PingFang SC',
          fontWeight: 400,
          fontSize: 12,
          color: '#222222',
          lineHeight: 20,
          textAlign: 'left',
          fontStyle: 'normal'
        },
        margin: 13
      },
      interval: 1
    }],
    yAxis: [{
      type: 'value',
      name: '个',
     
      nameTextStyle: {
        fontFamily: 'PingFangSC, PingFang SC',
        fontWeight: 400,
        fontSize: 12,
        color: '#666666',
        fontStyle: 'normal',
        align: 'center',
        padding: [0, 20, 0, 0]
      },
      splitLine: {
        lineStyle: {
          color: 'rgb(220, 232, 245)',
          type: 'dashed'
        }
      },
      axisTick: { show: false },
      axisLabel: {
        show: true,
        textStyle: {
          fontFamily: 'PingFangSC, PingFang SC',
          fontWeight: 400,
          fontSize: 12,
          color: '#666666',
          fontStyle: 'normal'
        },
        margin: 10
      },
      axisLine: { show: false }
    }],
    series: [{
      name: '内部柱子',
      type: 'bar',
      barWidth: 15,
      z: 19,
      barGap: '-100%',
      showBackground: false,
      itemStyle: {
        color: function (params) {
          return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#008AFF' },
            { offset: 1, color: '#3C6DCD' }
          ])
        }
      },
      data: barData
    }, {
      name: '上部圆',
      type: 'pictorialBar',
      silent: true,
      symbolSize: [15, 6],
      symbolOffset: [0, -4],
      symbolPosition: 'end',
      z: 22,
      color: '#82F3FF',
      data: barData
    }]
  }
}

/**
 * 组件挂载时初始化图表
 */
onMounted(() => {
  // 初始化总对话趋势图
  if (chartTotal.value) {
    const chart = echarts.init(chartTotal.value)
    chart.setOption(getMiniChartOption())
  }
  // 初始化实时用户柱状图
  if (chartRealtime.value) {
    const chart = echarts.init(chartRealtime.value)
    chart.setOption(getBarChartOption())
  }
  // 初始化收藏模版库数量柱状图
  if (chartContainer.value) {
    const chart = echarts.init(chartContainer.value)
    chart.setOption(getOption())
  }
  // 初始化各类知识库调用数量饼图
  if (chartKnowledge.value) {
    const chart = echarts.init(chartKnowledge.value)
    chart.setOption(getKnowledgeOption())
  }
})
</script>

<style scoped>
/* 页面容器 */
.agent-management-page {
  width: calc(1640px + 32px);
  height: calc(1017px + 32px);
  padding: 16px;
  background: #f5f7fa;
  display: flex;
  gap: 16px;
  box-sizing: border-box;
}

/* 左侧区域 */
.left-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.row-top,
.row-middle {
  display: flex;
  gap: 16px;
}

/* 统计卡片 */
.stat-card {
  width: 318px;
  height: 120px;
  background: #ffffff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 0 25px;
  box-sizing: border-box;
  gap: 20px;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stat-label {
  margin-bottom: 8px;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 20px;
  color: #2E4F72;
  line-height: 28px;
  text-align: left;
  font-style: normal;
}

.stat-value {
  font-family: FZZYJW--GB1, FZZYJW--GB1;
  font-weight: normal;
  font-size: 32px;
  color: #444444;
  line-height: 37px;
  text-align: left;
  font-style: normal;
}

.stat-chart {
  width: 130px;
  height: 54px;
}

/* 内容卡片 */
.content-card {
  background: #ffffff;
  border-radius: 4px;
  padding: 16px;
  box-sizing: border-box;
}

.card-large {
  width: 318px;
  height: 358px;
}

.card-template {
  width: 652px;
  height: 507px;
  display: flex;
  flex-direction: column;
}

/* 中间区域 */
.middle-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-knowledge {
  width: 637px;
  height: 494px;
  border-radius: 4px;
  background: #ffffff;
  padding: 16px;
  box-sizing: border-box;
}

.card-user-record {
  width: 637px;
  height: 507px;
  background: #ffffff;
  border-radius: 4px;
  padding: 16px;
  box-sizing: border-box;
}

/* 右侧区域 */
.right-section {
}

.card-realtime {
  width: 318px;
  height: 1017px;
  background: #ffffff;
  border-radius: 4px;
  padding: 16px;
  box-sizing: border-box;
}

/* 卡片标题 */
.card-title {
  font-family: PingFangSC, PingFang SC;
  font-weight: 600;
  font-size: 18px;
  color: #222222;
  line-height: 25px;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}

/* 柱状图容器 */
.bar-chart {
  width: 284px;
  height: 300px;
}

/* 饼图容器 */
.pie-chart {
  width: 260px;
  height: 260px;
  margin-top: 30px;
}

/* 模板列表 */
.template-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.template-item {
  width: 100%;
  height: 36px;
  background: #FFFFFF;
  border-radius: 4px;
  border: 2px solid #F0F0F0;
  display: flex;
  align-items: center;
  padding: 6px 3px;
  box-sizing: border-box;
}

.template-icon {
  width: 20px;
  height: 20px;
  margin-left: 3px;
  margin-right: 3px;
}

.template-name {
  flex: 1;
  max-width: 480px;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #444444;
  line-height: 20px;
  text-align: left;
  font-style: normal;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-date {
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #999999;
  line-height: 20px;
  text-align: right;
  font-style: normal;
  margin-left: 16px;
  margin-right: 7px;
}

/* 用户记录列表 */
.user-record-list {
  width: 605px;
  height: 449px;
  border-radius: 4px 4px 0px 0px;
  border: 1px solid #F0F0F0;
  overflow: hidden;
}

.record-header {
  width: 605px;
  height: 40px;
  background: #F2F2F2;
  border-radius: 4px 4px 0px 0px;
  border: 1px solid #F0F0F0;
  display: flex;
}

.header-item {
  font-family: PingFangSC, PingFang SC;
  font-weight: 600;
  font-size: 14px;
  color: #222222;
  line-height: 41px;
  text-align: left;
  font-style: normal;
  padding-left: 20px;
  box-sizing: border-box;
}

.header-item.col-username {
  width: 120px;
}

.header-item.col-time {
  width: 180px;
}

.header-item.col-status {
  width: 120px;
}

.header-item.col-action {
  width: 185px;
}

.record-content {
  overflow-y: auto;
  max-height: calc(449px - 40px);
}

.record-row {
  display: flex;
  border-bottom: 1px solid #F0F0F0;
}

.record-item {
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #222222;
  line-height: 41px;
  text-align: left;
  font-style: normal;
  padding-left: 20px;
  box-sizing: border-box;
}

.record-item.col-username {
  width: 120px;
}

.record-item.col-time {
  width: 180px;
}

.record-item.col-status {
  width: 120px;
}

.record-item.col-action {
  width: 185px;
}

.record-item.action {
  color: #0083FF;
}

/* 实时问题流样式 */
.realtime-list {
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(1017px - 80px);
  display: flex;
  flex-direction: column;
  row-gap: 12px;
}

.realtime-item {
  width: 100%;
  height: 113px;
  background: linear-gradient(178deg, #E0EDFF 0%, rgba(224, 243, 255, 0) 100%);
  border-radius: 4px;
  padding: 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid #F0F0F0;
  cursor: pointer;
}

.realtime-item:hover {
  border: 1px solid #346FF7;
}

.user-name {
  font-family: PingFangSC, PingFang SC;
  font-weight: 500;
  font-size: 16px;
  color: #444444;
  line-height: 22px;
  text-align: left;
  font-style: normal;
}

.question-box {
  width: 100%;
  height: 32px;
  background: linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 100%);
  border-radius: 4px;
  border: 1px solid #FFFFFF;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #666666;
  line-height: 32px;
  text-align: left;
  font-style: normal;
  padding-left: 10px;
  box-sizing: border-box;
}

.keywords {
  display: flex;
  gap: 8px;
}

.keyword-tag {
  display: inline-flex;
  align-items: center;
  height: 20px;
  background: #FFFFFF;
  border-radius: 4px;
  border: 1px solid #FFB420;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #FFB420;
  line-height: 17px;
  padding: 0 4px;
  text-align: left;
  font-style: normal;
  justify-content: center;
}
</style>
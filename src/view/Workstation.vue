<template>
  <div class="workstation-page">
    <div class="left-section">
      <!-- 顶部区域 -->
      <div class="top-section">
        <!-- 当前时间 -->
        <div class="time-card card">
          <div class="card-title">当前时间</div>
          <div class="time-content">
            <div class="date-row">
              <span class="year">{{ currentTime.year }}</span>
              <span class="month-day">{{ currentTime.month }}月{{ currentTime.day }}日</span>
              <span class="week">星期{{ currentTime.weekDay }}</span>
            </div>
            <div class="time-row">
              <span class="time">{{ currentTime.time }}</span>
              <div class="clock-icon">🕒</div>
            </div>
          </div>
        </div>

        <!-- 资源申请记录 -->
        <div class="resource-apply-card card">
          <div class="card-title">资源申请记录</div>
          <div class="resource-stats">
            <div class="stat-item">
              <div class="stat-label">累计申请资源</div>
              <div class="stat-value">{{ resourceApply.totalApply }}<span class="unit">次</span></div>
            </div>
            <div class="stat-item">
              <div class="stat-label">累计申请CPU</div>
              <div class="stat-value">{{ resourceApply.totalCpu }}<span class="unit">个</span></div>
            </div>
            <div class="stat-item">
              <div class="stat-label">累计申请内存</div>
              <div class="stat-value">{{ resourceApply.totalMemory }}<span class="unit">GB</span></div>
            </div>
            <div class="stat-item">
              <div class="stat-label">累计申请存储</div>
              <div class="stat-value">{{ resourceApply.totalStorage }}<span class="unit">TB</span></div>
            </div>
            <div class="stat-item">
              <div class="stat-label">累计申请GPU</div>
              <div class="stat-value">{{ resourceApply.totalGpu }}<span class="unit">个</span></div>
            </div>
          </div>
        </div>
      </div>
      <!-- 中间区域 -->
      <div class="middle-section">
        <!-- 设备GPU使用量 -->
        <div class="gpu-usage-card card">
          <div class="card-title">设备GPU使用量</div>
          <div ref="gpuUsageChart" class="chart-container"></div>
        </div>

        <!-- 资源分配统计 -->
        <div class="resource-allocation-card card">
          <div class="card-title">资源分配统计</div>
          <div class="allocation-grid">
            <div class="allocation-item">
              <div ref="cpuChart" class="gauge-chart"></div>
              <div class="allocation-info">
                <div class="info-row">
                  <span class="info-label">CPU总量</span>
                  <span class="info-value">{{ resourceAllocation.cpu.total }}<span class="unit">个</span></span>
                </div>
                <div class="info-row">
                  <span class="info-label">CPU已分配</span>
                  <span class="info-value">{{ resourceAllocation.cpu.allocated }}<span class="unit">个</span></span>
                </div>
              </div>
            </div>
            <div class="allocation-item">
              <div ref="memoryChart" class="gauge-chart"></div>
              <div class="allocation-info">
                <div class="info-row">
                  <span class="info-label">内存总量</span>
                  <span class="info-value">{{ resourceAllocation.memory.total }}<span class="unit">GB</span></span>
                </div>
                <div class="info-row">
                  <span class="info-label">内存已分配</span>
                  <span class="info-value">{{ resourceAllocation.memory.allocated }}<span class="unit">GB</span></span>
                </div>
              </div>
            </div>
            <div class="allocation-item">
              <div ref="storageChart" class="gauge-chart"></div>
              <div class="allocation-info">
                <div class="info-row">
                  <span class="info-label">存储总量</span>
                  <span class="info-value">{{ resourceAllocation.storage.total }}<span class="unit">TB</span></span>
                </div>
                <div class="info-row">
                  <span class="info-label">存储已分配</span>
                  <span class="info-value">{{ resourceAllocation.storage.allocated }}<span class="unit">TB</span></span>
                </div>
              </div>
            </div>
            <div class="allocation-item">
              <div ref="gpuChart" class="gauge-chart"></div>
              <div class="allocation-info">
                <div class="info-row">
                  <span class="info-label">GPU总量</span>
                  <span class="info-value">{{ resourceAllocation.gpu.total }}<span class="unit">个</span></span>
                </div>
                <div class="info-row">
                  <span class="info-label">GPU已分配</span>
                  <span class="info-value">{{ resourceAllocation.gpu.allocated }}<span class="unit">个</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部区域 -->
      <div class="bottom-section">
        <!-- 设备GPU使用量表格1 -->
        <div class="table-card card">
          <div class="card-title">设备GPU使用量</div>
          <table class="custom-table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>申请数量</th>
                <th>审核数量</th>
                <th>运行数量</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in gpuUsageTable1" :key="index">
                <td>{{ item.name }}</td>
                <td>{{ item.applyCount }}</td>
                <td>{{ item.auditCount }}</td>
                <td>{{ item.runCount }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 设备GPU使用量表格2 -->
        <div class="table-card2 card">
          <div class="card-title">设备GPU使用量</div>
          <table class="custom-table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>IP</th>
                <th>CPU</th>
                <th>显卡</th>
                <th>内存</th>
                <th>机器名称</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in gpuUsageTable2" :key="index">
                <td>{{ item.name }}</td>
                <td>{{ item.ip }}</td>
                <td>{{ item.cpu }}</td>
                <td>{{ item.gpu }}</td>
                <td>{{ item.memory }}</td>
                <td>{{ item.machineName }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="right-section">
      <!-- 物理机状态 -->
      <div class="physical-status-card card">
        <div class="card-title">物理机状态</div>
        <div class="physical-stats">
          <div class="phys-item">
            <div class="phys-label">集群物理机</div>
            <div class="phys-value normal">{{ physicalStatus.total }}</div>
          </div>
          <div class="phys-item">
            <div class="phys-label">异常物理机</div>
            <div class="phys-value warning">{{ physicalStatus.abnormal }}</div>
          </div>
          <div class="phys-item">
            <div class="phys-label">集群监控状态</div>
            <div class="phys-value normal">{{ physicalStatus.monitorStatus }}</div>
          </div>
        </div>
      </div>

      <!-- 资源使用率监测 -->
      <div class="resource-monitor-card card">
        <div class="card-title">资源使用率监测</div>
        <div class="monitor-charts">
          <div class="monitor-item">
            <div class="monitor-title">CPU使用率</div>
            <div ref="cpuTrendChart" class="trend-chart"></div>
          </div>
          <div class="monitor-item">
            <div class="monitor-title">内存使用率</div>
            <div ref="memoryTrendChart" class="trend-chart"></div>
          </div>
          <div class="monitor-item">
            <div class="monitor-title">存储使用率</div>
            <div ref="storageTrendChart" class="trend-chart"></div>
          </div>
          <div class="monitor-item">
            <div class="monitor-title">GPU使用率</div>
            <div ref="gpuTrendChart" class="trend-chart"></div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

// ========== 时间数据 ==========
const currentTime = ref({
  year: '2026年',
  month: 4,
  day: 2,
  weekDay: '四',
  time: '16:54:23'
})

let timeTimer = null
const updateTime = () => {
  const now = new Date()
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  currentTime.value = {
    year: now.getFullYear() + '年',
    month: now.getMonth() + 1,
    day: now.getDate(),
    weekDay: weekDays[now.getDay()],
    time: now.toTimeString().slice(0, 8)
  }
}

// ========== 资源申请记录数据 ==========
const resourceApply = ref({
  totalApply: 46180,
  totalCpu: 724460,
  totalMemory: 2278150,
  totalStorage: 500,
  totalGpu: 87728
})

// ========== 物理机状态数据 ==========
const physicalStatus = ref({
  total: 507,
  abnormal: 36,
  monitorStatus: 0
})

// ========== 资源分配统计数据 ==========
const resourceAllocation = ref({
  cpu: {
    total: 7820,
    allocated: 5364,
    usageRate: 68.59
  },
  memory: {
    total: 89091.56,
    allocated: 55824.21,
    usageRate: 62.66
  },
  storage: {
    total: 0,
    allocated: 0,
    usageRate: 68.59
  },
  gpu: {
    total: 1462,
    allocated: 1238,
    usageRate: 68.59
  }
})

// ========== 设备GPU使用量数据（柱状图） ==========
const gpuUsageData = ref({
  categories: ['设备1', '设备2', '设备3'],
  series: [
    { name: '申请', data: [120, 220, 150], color: '#5470c6' },
    { name: '审核', data: [180, 280, 200], color: '#91cc75' },
    { name: '运行', data: [240, 350, 280], color: '#fac858' }
  ]
})

// ========== 资源使用率趋势数据 ==========
const generateTrendData = () => {
  const times = []
  const data = []
  const now = new Date()
  for (let i = 0; i < 10; i++) {
    const t = new Date(now.getTime() - (9 - i) * 60000)
    times.push(t.toTimeString().slice(0, 5))
    data.push(Math.floor(Math.random() * 40) + 40)
  }
  return { times, data }
}

const cpuTrendData = ref(generateTrendData())
const memoryTrendData = ref(generateTrendData())
const storageTrendData = ref(generateTrendData())
const gpuTrendData = ref(generateTrendData())

// ========== 表格数据 ==========
const gpuUsageTable1 = ref([
  { name: '张三', applyCount: 4, auditCount: 4, runCount: 4 },
  { name: '张三', applyCount: 4, auditCount: 4, runCount: 4 },
  { name: '张三', applyCount: 4, auditCount: 4, runCount: 4 },
  { name: '张三', applyCount: 4, auditCount: 4, runCount: 4 },
  { name: '张三', applyCount: 4, auditCount: 4, runCount: 4 },
  { name: '张三', applyCount: 4, auditCount: 4, runCount: 4 },
  { name: '张三', applyCount: 4, auditCount: 4, runCount: 4 },
  { name: '张三', applyCount: 4, auditCount: 4, runCount: 4 },
  { name: '张三', applyCount: 4, auditCount: 4, runCount: 4 }
])

const gpuUsageTable2 = ref([
  { name: '张三', ip: '192.168.1.1', cpu: 32, gpu: '16G', memory: '64G', machineName: 'node1' },
  { name: '张三', ip: '192.168.1.1', cpu: 32, gpu: '16G', memory: '64G', machineName: 'node2' },
  { name: '张三', ip: '192.168.1.1', cpu: 32, gpu: '16G', memory: '64G', machineName: 'node3' },
  { name: '张三', ip: '192.168.1.1', cpu: 32, gpu: '16G', memory: '64G', machineName: 'node4' },
  { name: '张三', ip: '192.168.1.1', cpu: 32, gpu: '16G', memory: '64G', machineName: 'node5' },
  { name: '张三', ip: '192.168.1.1', cpu: 32, gpu: '16G', memory: '64G', machineName: 'node6' },
  { name: '张三', ip: '192.168.1.1', cpu: 32, gpu: '16G', memory: '64G', machineName: 'node7' },
  { name: '张三', ip: '192.168.1.1', cpu: 32, gpu: '16G', memory: '64G', machineName: 'node8' },
  { name: '张三', ip: '192.168.1.1', cpu: 32, gpu: '16G', memory: '64G', machineName: 'node9' }
])

// ========== ECharts 实例 ==========
const gpuUsageChart = ref(null)
const cpuChart = ref(null)
const memoryChart = ref(null)
const storageChart = ref(null)
const gpuChart = ref(null)
const cpuTrendChart = ref(null)
const memoryTrendChart = ref(null)
const storageTrendChart = ref(null)
const gpuTrendChart = ref(null)

let charts = []

// ========== 图表配置 ==========
const initGpuUsageChart = () => {
  const chart = echarts.init(gpuUsageChart.value)
  const option = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: gpuUsageData.value.categories,
      axisLine: { lineStyle: { color: '#ccc' } },
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#eee' } },
      axisLabel: { color: '#666' }
    },
    series: gpuUsageData.value.series.map(s => ({
      name: s.name,
      type: 'bar',
      data: s.data,
      itemStyle: { color: s.color },
      barWidth: '20%'
    }))
  }
  chart.setOption(option)
  charts.push(chart)
}

const initGaugeChart = (chartRef, value, name, color) => {
  const chart = echarts.init(chartRef)
  const option = {
    series: [{
      type: 'gauge',
      startAngle: 90,
      endAngle: -270,
      radius: '80%',
      pointer: { show: false },
      progress: {
        show: true,
        overlap: false,
        roundCap: true,
        clip: false,
        itemStyle: { color: color }
      },
      axisLine: {
        lineStyle: { width: 8, color: [[1, '#e6e6e6']] }
      },
      splitLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      data: [{
        value: value,
        name: name,
        title: {
          offsetCenter: ['0%', '0%'],
          fontSize: 12,
          color: '#666'
        },
        detail: {
          valueAnimation: true,
          offsetCenter: ['0%', '-20%'],
          fontSize: 16,
          fontWeight: 'bold',
          formatter: '{value}%',
          color: '#333'
        }
      }],
      detail: { fontSize: 16 }
    }]
  }
  chart.setOption(option)
  charts.push(chart)
}

const initTrendChart = (chartRef, data, color) => {
  const chart = echarts.init(chartRef)
  const option = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.times,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#999', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
      axisLabel: { color: '#999', fontSize: 10 }
    },
    series: [{
      type: 'line',
      data: data.data,
      smooth: true,
      symbol: 'none',
      lineStyle: { color: color, width: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: color + '40' },
          { offset: 1, color: color + '00' }
        ])
      }
    }]
  }
  chart.setOption(option)
  charts.push(chart)
}

// ========== 数据更新方法 ==========
const updateResourceApply = (data) => {
  resourceApply.value = { ...resourceApply.value, ...data }
}

const updatePhysicalStatus = (data) => {
  physicalStatus.value = { ...physicalStatus.value, ...data }
}

const updateResourceAllocation = (data) => {
  resourceAllocation.value = { ...resourceAllocation.value, ...data }
  updateGaugeCharts()
}

const updateGpuUsageData = (data) => {
  gpuUsageData.value = { ...gpuUsageData.value, ...data }
  updateGpuUsageChart()
}

const updateTrendData = () => {
  cpuTrendData.value = generateTrendData()
  memoryTrendData.value = generateTrendData()
  storageTrendData.value = generateTrendData()
  gpuTrendData.value = generateTrendData()
  updateTrendCharts()
}

const updateGpuUsageTable1 = (data) => {
  gpuUsageTable1.value = data
}

const updateGpuUsageTable2 = (data) => {
  gpuUsageTable2.value = data
}

// 更新图表方法
const updateGpuUsageChart = () => {
  const chart = charts.find(c => c === echarts.getInstanceByDom(gpuUsageChart.value))
  if (chart) {
    chart.setOption({
      xAxis: { data: gpuUsageData.value.categories },
      series: gpuUsageData.value.series.map(s => ({
        name: s.name,
        data: s.data,
        itemStyle: { color: s.color }
      }))
    })
  }
}

const updateGaugeCharts = () => {
  const gaugeData = [
    { ref: cpuChart.value, value: resourceAllocation.value.cpu.usageRate, name: 'CPU', color: '#5470c6' },
    { ref: memoryChart.value, value: resourceAllocation.value.memory.usageRate, name: '内存', color: '#91cc75' },
    { ref: storageChart.value, value: resourceAllocation.value.storage.usageRate, name: '存储', color: '#fac858' },
    { ref: gpuChart.value, value: resourceAllocation.value.gpu.usageRate, name: 'GPU', color: '#ee6666' }
  ]

  gaugeData.forEach(({ ref, value, name }) => {
    const chart = charts.find(c => c === echarts.getInstanceByDom(ref))
    if (chart) {
      chart.setOption({
        series: [{ data: [{ value, name }] }]
      })
    }
  })
}

const updateTrendCharts = () => {
  const trendData = [
    { ref: cpuTrendChart.value, data: cpuTrendData.value, color: '#5470c6' },
    { ref: memoryTrendChart.value, data: memoryTrendData.value, color: '#91cc75' },
    { ref: storageTrendChart.value, data: storageTrendData.value, color: '#fac858' },
    { ref: gpuTrendChart.value, data: gpuTrendData.value, color: '#ee6666' }
  ]

  trendData.forEach(({ ref, data, color }) => {
    const chart = charts.find(c => c === echarts.getInstanceByDom(ref))
    if (chart) {
      chart.setOption({
        xAxis: { data: data.times },
        series: [{
          data: data.data, lineStyle: { color }, areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: color + '40' },
              { offset: 1, color: color + '00' }
            ])
          }
        }]
      })
    }
  })
}

// 自动刷新定时器
let dataRefreshTimer = null
const startAutoRefresh = (interval = 30000) => {
  dataRefreshTimer = setInterval(() => {
    updateTrendData()
  }, interval)
}

const stopAutoRefresh = () => {
  if (dataRefreshTimer) {
    clearInterval(dataRefreshTimer)
    dataRefreshTimer = null
  }
}

// 暴露方法给父组件
defineExpose({
  updateResourceApply,
  updatePhysicalStatus,
  updateResourceAllocation,
  updateGpuUsageData,
  updateTrendData,
  updateGpuUsageTable1,
  updateGpuUsageTable2,
  startAutoRefresh,
  stopAutoRefresh
})

// ========== 生命周期 ==========
onMounted(() => {
  updateTime()
  timeTimer = setInterval(updateTime, 1000)

  initGpuUsageChart()
  initGaugeChart(cpuChart.value, resourceAllocation.value.cpu.usageRate, 'CPU', '#5470c6')
  initGaugeChart(memoryChart.value, resourceAllocation.value.memory.usageRate, '内存', '#91cc75')
  initGaugeChart(storageChart.value, resourceAllocation.value.storage.usageRate, '存储', '#fac858')
  initGaugeChart(gpuChart.value, resourceAllocation.value.gpu.usageRate, 'GPU', '#ee6666')

  initTrendChart(cpuTrendChart.value, cpuTrendData.value, '#5470c6')
  initTrendChart(memoryTrendChart.value, memoryTrendData.value, '#91cc75')
  initTrendChart(storageTrendChart.value, storageTrendData.value, '#fac858')
  initTrendChart(gpuTrendChart.value, gpuTrendData.value, '#ee6666')

  window.addEventListener('resize', handleResize)
  startAutoRefresh()
})

onUnmounted(() => {
  if (timeTimer) clearInterval(timeTimer)
  stopAutoRefresh()
  window.removeEventListener('resize', handleResize)
  charts.forEach(chart => chart.dispose())
})

const handleResize = () => {
  charts.forEach(chart => chart.resize())
}
</script>

<style scoped>
.workstation-page {
  padding: 0 16px;
  background: #f5f7fa;
  width: 1672px;
  height: 1033px;
  display: flex;
  justify-content: space-between;
}

.card {
  background: #fff;
  padding: 16px;
}

.time-card {
  width: 395px;
  height: 142px;
}

.resource-apply-card {
  width: 819px;
  height: 142px;
}

.physical-status-card {
  width: 395px;
  height: 142px;
}

.gpu-usage-card {
  width: 395px;
  height: 358px;
}

.resource-allocation-card {
  width: 819px;
  height: 358px;
}

.resource-monitor-card {
  width: 395px;
  height: 859px;
}

.table-card {
  width: 395px;
  height: 485px;
}

.table-card2 {
  width: 819px;
  height: 485px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}

/* 顶部区域 */
.top-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

/* 时间卡片 */
.time-content {
  padding: 8px 0;
}

.date-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #666;
}

.year {
  color: #409eff;
  font-weight: 500;
}

.time-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.time {
  font-size: 32px;
  font-weight: 700;
  color: #409eff;
  font-family: 'Courier New', monospace;
}

.clock-icon {
  font-size: 24px;
  color: #409eff;
}

/* 资源申请记录 */
.resource-stats {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.stat-value .unit {
  font-size: 12px;
  color: #999;
  font-weight: normal;
  margin-left: 2px;
}

/* 物理机状态 */
.physical-stats {
  display: flex;
  justify-content: space-around;
}

.phys-item {
  text-align: center;
}

.phys-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.phys-value {
  font-size: 24px;
  font-weight: 700;
}

.phys-value.normal {
  color: #67c23a;
}

.phys-value.warning {
  color: #e6a23c;
}

/* 中间区域 */
.middle-section {
  height: 358px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.chart-container {
  height: 200px;
}

/* 资源分配统计 */
.allocation-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.allocation-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.gauge-chart {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
}

.allocation-info {
  flex: 1;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}

.info-label {
  color: #666;
}

.info-value {
  color: #333;
  font-weight: 500;
}

.info-value .unit {
  font-size: 11px;
  color: #999;
  margin-left: 2px;
}

/* 资源使用率监测 */
.monitor-charts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.monitor-item {
  background: #fafafa;
  padding: 8px;
  height: 191px;
  position: relative;
}

.monitor-title {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  position: absolute;
  top: 5px;
  left: 50%;
  transform: translateX(-50%);
}

.trend-chart {
  height: 191px;
}

/* 底部区域 */
.bottom-section {
  display: flex;
  justify-content: space-between;
}

.table-card {
  min-height: 300px;
}

/* 自定义表格样式 */
.custom-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.custom-table th {
  background: #f5f7fa;
  color: #666;
  font-weight: 500;
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #e4e7ed;
}

.custom-table td {
  color: #333;
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
}

.custom-table tr:hover {
  background: #f5f7fa;
}

.left-section {
  width: 1230px;
  height: 100%;
}

.right-section {
  width: 395px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 16px;
}
</style>

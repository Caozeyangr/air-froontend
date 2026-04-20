<template>
  <div class="workstation-page">
    <div class="left-section">
      <!-- 顶部区域 -->
      <div class="top-section">
        <!-- 当前时间 --> 
        <div class="time-card card" :style="{ backgroundImage: `url(${timeCardBg})`, backgroundSize: '100% 100%', backgroundPosition: 'center' }">
         <div class="card-title">当前时间</div> 
          <div class="time-content">
            <div class="date-time-wrapper">
            <div class="date-row">
              <span class="year">{{ currentTime.year }}</span>
              <span class="separator">|</span>
              <span class="month-day">{{ currentTime.month }}月{{ currentTime.day }}日</span>
              <span class="separator">|</span>
              <span class="week">星期{{ currentTime.weekDay }}</span>
            </div>
            <div class="time-row">
              <span class="time">{{ currentTime.time }}</span>
            </div>

            </div>
        
            <div>
              <div ref="chartRef" class="clock-container"></div>
            </div>
          </div>
        </div>

        <!-- 资源申请记录 -->
        <div class="resource-apply-card card" :style="{ backgroundImage: `url(${resourceApplyBg})`, backgroundSize: '100% 100%', backgroundPosition: 'center' }">
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
      <div class="physical-status-card card" :style="{ backgroundImage: `url(${physicalStatusBg})`, backgroundSize: '100% 100%', backgroundPosition: 'center' }">
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
import timeCardBg from '../assets/workstation/背景-当前时间@2x.png'
import resourceApplyBg from '../assets/workstation/背景-资源申请记录@2x.png'
import physicalStatusBg from '../assets/workstation/背景-物理机状态@2x.png'

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
    usageRate: 23.66
  },
  memory: {
    total: 89091.56,
    allocated: 55824.21,
    usageRate: 62.66
  },
  storage: {
    total: 0,
    allocated: 0,
    usageRate: 54.33
  },
  gpu: {
    total: 1462,
    allocated: 1238,
    usageRate: 87.99
  }
})

// ========== 设备GPU使用量数据（柱状图） ==========
const gpuUsageData = ref({
  categories: ['设备1', '设备2', '设备3'],
  // series: [
  //   { 
  //     name: '申请', 
  //     data: [120, 220, 150], 
  //     color: '#5470c6',
  //     topColor: '#008AFFFF',
  //     bottomColor: '#3C6DCDFF',
  //     topCircleColor: '#82F3FFFF'
  //   },
  //   { 
  //     name: '审核', 
  //     data: [180, 280, 200], 
  //     color: '#91cc75',
  //     topColor: '#67C23A',
  //     bottomColor: '#4CAF50',
  //     topCircleColor: '#B3E5FC'
  //   },
  //   { 
  //     name: '运行', 
  //     data: [240, 350, 280], 
  //     color: '#fac858',
  //     topColor: '#E6A23C',
  //     bottomColor: '#F56C6C',
  //     topCircleColor: '#FFD700'
  //   }
  // ]
  data1: [120, 220, 150],
  data2: [180, 280, 200],
  data3: [240, 350, 280]
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
const chartRef = ref(null)
let myChart = null
let timer = null

let charts = []

// ========== 图表配置 ==========
const initGpuUsageChart = () => {
  const chart = echarts.init(gpuUsageChart.value)
  const barWidth = 20
  const option = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
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
      name: '个',
      nameTextStyle: {
        color: '#666',
        padding: [0, 0, 0, -20]
      },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#DCDCDCFF', type: 'dashed' } },
      axisLabel: { color: '#666' }
    },
    series: [
      // --------------------- 申请 ---------------------
      {
        name: '申请',
        type: 'bar',
        barWidth: barWidth,
        z: 19,
        backgroundStyle: {
          color: 'rgba(232, 245, 255, 0.8)'
        },
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#008AFF' },
            { offset: 1, color: '#3C6DCD' }
          ])
        },
        data: gpuUsageData.value.data1,
      },
      {
        name: '申请-顶圆',
        type: 'pictorialBar',
        silent: true,
        symbolSize: [barWidth, 8],
        symbolOffset: [-22, -4],
        symbolPosition: 'end',
        z: 22,
        color: '#0df3ff',
        data: gpuUsageData.value.data1,
      },

      // --------------------- 审核 ---------------------
      {
        name: '审核',
        type: 'bar',
        barWidth: barWidth,
        z: 19,
        backgroundStyle: {
          color: 'rgba(232, 245, 255, 0.8)'
        },
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#369d6f' },
            { offset: 1, color: '#6ffd9e' }
          ])
        },
        data: gpuUsageData.value.data2,
      },
      {
        name: '审核-顶圆',
        type: 'pictorialBar',
        silent: true,
        symbolSize: [barWidth, 8],
        symbolOffset: [0, -4],
        symbolPosition: 'end',
        z: 22,
        color: '#6ffd9e',
        data: gpuUsageData.value.data2,
      },

      // --------------------- 运行 ---------------------
      {
        name: '运行',
        type: 'bar',
        barWidth: barWidth,
        z: 19,
        backgroundStyle: {
          color: 'rgba(232, 245, 255, 0.8)'
        },
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#FFC300' },
            { offset: 1, color: '#FF8B0A' }
          ])
        },
        data: gpuUsageData.value.data3,
      },
      {
        name: '运行-顶圆',
        type: 'pictorialBar',
        silent: true,
        symbolSize: [barWidth, 8],
        symbolOffset: [22, -4],
        symbolPosition: 'end',
        z: 22,
        color: '#FFEB0D',
        data: gpuUsageData.value.data3,
      }
    ]
  }
  chart.setOption(option)
  charts.push(chart)
}

const initGaugeChart = (chartRef, value, name, color) => {
  const chart = echarts.init(chartRef)
  const max = 5
  const option = {
    angleAxis: {
      show: true,
      axisLine: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false },
      min: 0,
      max: 5.8,
      startAngle: 245.95,
      clockwise: true,
      splitNumber: 120,
      axisTick: {
        show: true,
        length: 6,
        polar: {
          radius: '40%',
        },
        axisTick: {
          length: 10,
        },
        lineStyle: {
          width: 2,
          color: 'rgba(183, 220, 246, 0.3)',
        },
      },
    },
    radiusAxis: {
      type: 'category',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      data: ['a', 'b', 'c'],
      z: 10,
    },
    polar: {
      radius: '90%',
    },
    series: [
      {
        type: 'bar',
        data: [, , value / 100 * max],
        z: 1,
        coordinateSystem: 'polar',
        barMaxWidth: 40,
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#7E6CFF' },
          { offset: 1, color: '#59B5FF' },
        ]),
        barGap: '-100%',
      },
      {
        type: 'bar',
        data: [, , max],
        z: 0,
        silent: true,
        coordinateSystem: 'polar',
        barMaxWidth: 40,
        color: 'rgba(213, 242, 250, 0.6)',
        barGap: '-100%',
      },
      {
        type: 'pie',
        labelLine: { show: false },
        z: 0,
        radius: 30,
        animation: false,
        silent: true,
        itemStyle: {
          color: '#fff',
          borderColor: '#A8EDF7',
          borderWidth: 2,
          shadowColor: 'rgba(183, 220, 246, 0.5)',
          shadowBlur: 2,
          shadowOffsetY: 2,
        },
        data: [{ value: 100 }],
      },
      {
        type: 'pie',
        radius: ['88%', '82%'],
        hoverAnimation: false,
        startAngle: 225,
        endAngle: 0,
        data: [
          {
            name: '',
            value: (value / 100 * max) / 5,
            itemStyle: { color: 'rgba(0,0,0,0)' }
          },
          
          {
            name: '',
            value: 1.33 - (value / 100 * max) / 5,
            itemStyle: { color: 'rgba(255,255,255,0)' }
          },
        ],
      },
      {
        type: 'pie',
        radius: 32,
        labelLine: { show: false },
        label: {
          show: true,
          position: 'center',
          offset: [0, 5],
          formatter: function(params) {
            return '{value|' + value + '%}\n{name|' + name + '}';
          },
          rich: {
            value: {
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'DIN Alternate Bold',
              color: '#333',
              lineHeight: 20
            },
            name: {
              fontSize: 12,
              color: '#666',
              lineHeight: 16
            }
          }
        },
        animation: false,
        silent: true,
        itemStyle: {
          color: 'transparent'
        },
        data: [{ value: 100 }],
      }
    ],
    tooltip: { show: false },
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
      splitLine: { lineStyle: { color: '#DCDCDCFF', type: 'dashed' } },
      axisLabel: { color: '#666', fontSize: 10 }
    },
    series: [{
      type: 'line',
      data: data.data,
      smooth: false,
      symbol: 'none',
      lineStyle: {
        width: 2,
        color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [{
          offset: 0,
          color: '#1981E1FF'
        },
        {
          offset: 1,
          color: '#F27336FF'
        }
        ])
      },
      // areaStyle: {
      //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      //     { offset: 0, color: color + '40' },
      //     { offset: 1, color: color + '00' }
      //   ])
      // }
    }]
  }
  chart.setOption(option)
  charts.push(chart)
}

// 初始化时钟图表
const initChart = () => {
  myChart = echarts.init(chartRef.value)

  const option = {
    backgroundColor: 'transparent',
     grid: {
        show: false,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },
    series: [
  // 时针
  {
    name: 'hour',
    type: 'gauge',
    startAngle: 90,
    endAngle: -270,
    min: 0,
    max: 12,
    splitNumber: 12,
    clockwise: true,
    radius: '100%',
    center: ['50%', '50%'],
    axisLine: {
      lineStyle: {
        width: 2,
        color: [[1, 'rgba(195,200,202,0.8)']],
        shadowColor: 'rgba(195,200,202,0.5)',
         shadowBlur: 2
      }
    },
    splitLine: {
      distance: 0,
      length: 4,
      lineStyle: {
        color: 'rgba(195,200,202,0.8)',
        shadowColor: 'rgba(195,200,202,0.5)',
        shadowBlur: 1,
        shadowOffsetX: 0,
        shadowOffsetY: 0
      }
    },
    axisTick: {
      distance: 0,
      length: 2,
      splitNumber: 4,
      lineStyle: {
        color: 'rgba(195,200,202,0.6)',
        shadowColor: 'rgba(195,200,202,0.3)',
        shadowBlur: 1,
        shadowOffsetX: 0,
        shadowOffsetY: 0
      }
    },
    axisLabel: {
      fontSize: 7,
      distance: 3,
      formatter: value => value === 0 ? '' : value
    },
    pointer: {
      width: 1.5,                    
      length: '65%',
      offsetCenter: [0, 0],
      itemStyle: {
        color: '#D3D3D3',            // 浅灰色
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowBlur: 8,
        shadowOffsetX: 2,
        shadowOffsetY: 4
      }
    },
    detail: { show: false, width: 0, height: 0, offsetCenter: [0, 0] },
    silent: true,
    title: { show: false },
    data: [{ value: 0 }]
  },
  // 分针
  {
    name: 'minute',
    type: 'gauge',
    startAngle: 90,
    endAngle: -270,
    min: 0,
    max: 60,
    clockwise: true,
    radius: '100%',
    center: ['50%', '50%'],
    axisLine: { show: false },
    splitLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
    pointer: {
      width: 1.5,                   
      length: '75%',
      offsetCenter: [0, 0],
      itemStyle: {
        color: '#D3D3D3',            // 浅灰色
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowBlur: 8,
        shadowOffsetX: 2,
        shadowOffsetY: 2
      }
    },
    // anchor: {
    //   show: true,
    //   size: 5,
    //   showAbove: false,
    //   itemStyle: {
    //     borderWidth: 6,
    //     borderColor: '#D3D3D3',      // 锚点边框改为浅灰色
    //     shadowColor: 'rgba(0, 0, 0, 0.3)',
    //     shadowBlur: 8,
    //     shadowOffsetX: 2,
    //     shadowOffsetY: 4
    //   }
    // },
    detail: { show: false, width: 0, height: 0, offsetCenter: [0, 0] },
    silent: true,
    data: [{ value: 0 }]
  },
  // 秒针
  {
    name: 'second',
    type: 'gauge',
    startAngle: 90,
    endAngle: -270,
    min: 0,
    max: 60,
    animationEasingUpdate: 'bounceOut',
    clockwise: true,
    radius: '100%',
    center: ['50%', '50%'],
    axisLine: { show: false },
    splitLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
    pointer: {
      width: 1.5,                    // 改为细长一致宽度
      length: '85%',
      offsetCenter: [0, 0],
      itemStyle: {
        color: '#D3D3D3',            // 浅灰色
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowBlur: 8,
        shadowOffsetX: 2,
        shadowOffsetY: 4
      }
    },
    anchor: {
      show: true,
      size: 3,
      showAbove: true,
      itemStyle: {
        color: '#D3D3D3',            // 锚点填充改为浅灰色
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowBlur: 8,
        shadowOffsetX: 2,
        shadowOffsetY: 4
      }
    },
    detail: { show: false, width: 0, height: 0, offsetCenter: [0, 0] },
    silent: true,
    data: [{ value: 0 }]
  }
]
  }

  myChart.setOption(option)
  startTime()
  charts.push(myChart)
}

// 启动时钟定时器
const startTime = () => {
  timer = setInterval(() => {
    const date = new Date()
    const second = date.getSeconds()
    const minute = date.getMinutes() + second / 60
    const hour = (date.getHours() % 12) + minute / 60

    myChart.setOption({
      animationDurationUpdate: 300,
      series: [
        { name: 'hour', animation: hour !== 0, data: [{ value: hour }] },
        { name: 'minute', animation: minute !== 0, data: [{ value: minute }] },
        { name: 'second', animation: second !== 0, data: [{ value: second }] }
      ]
    })
  }, 1000)
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
    const barWidth = 20
    chart.setOption({
      xAxis: { data: gpuUsageData.value.categories },
      series: [
        // --------------------- 申请 ---------------------
        {
          name: '申请',
          type: 'bar',
          barWidth: barWidth,
          z: 19,
          backgroundStyle: {
            color: 'rgba(232, 245, 255, 0.8)'
          },
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#006caf' },
              { offset: 1, color: '#04f2ff' }
            ])
          },
          data: gpuUsageData.value.data1,
        },
        {
          name: '申请-顶圆',
          type: 'pictorialBar',
          silent: true,
          symbolSize: [barWidth, 10],
          symbolOffset: [-30, -6],
          symbolPosition: 'end',
          z: 22,
          color: '#0df3ff',
          data: gpuUsageData.value.data1,
        },

        // --------------------- 审核 ---------------------
        {
          name: '审核',
          type: 'bar',
          barWidth: barWidth,
          z: 19,
          backgroundStyle: {
            color: 'rgba(232, 245, 255, 0.8)'
          },
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#369d6f' },
              { offset: 1, color: '#6ffd9e' }
            ])
          },
          data: gpuUsageData.value.data2,
        },
        {
          name: '审核-顶圆',
          type: 'pictorialBar',
          silent: true,
          symbolSize: [barWidth, 10],
          symbolOffset: [0, -6],
          symbolPosition: 'end',
          z: 22,
          color: '#6ffd9e',
          data: gpuUsageData.value.data2,
        },

        // --------------------- 运行 ---------------------
        {
          name: '运行',
          type: 'bar',
          barWidth: barWidth,
          z: 19,
          backgroundStyle: {
            color: 'rgba(232, 245, 255, 0.8)'
          },
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#FFC300' },
              { offset: 1, color: '#FF8B0A' }
            ])
          },
          data: gpuUsageData.value.data3,
        },
        {
          name: '运行-顶圆',
          type: 'pictorialBar',
          silent: true,
          symbolSize: [barWidth, 10],
          symbolOffset: [30, -6],
          symbolPosition: 'end',
          z: 22,
          color: '#ffbc5e',
          data: gpuUsageData.value.data3,
        }
      ]
    })
  }
}

const updateGaugeCharts = () => {
  const max = 5
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
        series: [
          { data: [, , value / 100 * max] },
          { data: [, , max] },
          {},
          {
            data: [
              {
                value: (value / 100 * max) / 5
              },
              {},
              {
                value: 1.33 - (value / 100 * max) / 5
              }
            ]
          },
          {
            label: {
              formatter: function(params) {
                return '{value|' + value + '%}\n{name|' + name + '}';
              },
              rich: {
                value: {
                  fontSize: 16,
                  fontWeight: 'bold',
                  fontFamily: 'DIN Alternate Bold',
                  color: '#333',
                  lineHeight: 20
                },
                name: {
                  fontSize: 12,
                  color: '#666',
                  lineHeight: 16
                }
              }
            }
          }
        ]
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
          data: data.data,
          lineStyle: {
            width: 2,
            color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [{
              offset: 0,
              color: '#1981E1FF'
            },
            {
              offset: 1,
              color: '#F27336FF'
            }
          //   ])
          // },
          // areaStyle: {
          //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          //     { offset: 0, color: color + '40' },
          //     { offset: 1, color: color + '00' }
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

  initChart()
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
  if (timer) clearInterval(timer)
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
  /* padding: 8px 0; */
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.date-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #444444;
}

.date-time-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.year {
  color: #444444;
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

.clock-container {
  width: 70px;
  height: 70px;
  margin-right: 28px;
  border-radius: 100%;
  background-color: #fff;
}

/* .clock-icon {
  font-size: 24px;
  color: #409eff;
} */

/* 资源申请记录 */
.resource-stats {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 20px;
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
  font-size: 24px;
  font-weight: 600;
  color: #388DEF;
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
  margin-top: 20px;
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
  height: 275px;
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
  width: 376px;
  height: 133px;
  background-color: #F9F9F9;
  padding: 16px;
  border-radius: 8px;
}

.gauge-chart {
  width: 103px;
  height: 103px;
  flex-shrink: 0;
  border: 1px solid #B2BFD9;
  border-radius: 50%;
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
  /* background: #fafafa; */
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

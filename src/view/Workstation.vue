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
              <div class="stat-value">{{ resourceApply.totalApply || 0 }}<span class="unit">次</span></div>
            </div>
            <div class="stat-item">
              <div class="stat-label">累计申请CPU</div>
              <div class="stat-value">{{ resourceApply.totalCpu || 0 }}<span class="unit">个</span></div>
            </div>
            <div class="stat-item">
              <div class="stat-label">累计申请内存</div>
              <div class="stat-value">{{ resourceApply.totalMemory || 0 }}<span class="unit">GB</span></div>
            </div>
            <div class="stat-item">
              <div class="stat-label">累计申请存储</div>
              <div class="stat-value">{{ resourceApply.totalStorage || 0 }}<span class="unit">TB</span></div>
            </div>
            <div class="stat-item">
              <div class="stat-label">累计申请GPU</div>
              <div class="stat-value">{{ resourceApply.totalGpu || 0 }}<span class="unit">个</span></div>
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
                  <span class="info-value">{{ resourceAllocation.cpu?.total || 0 }}<span class="unit">个</span></span>
                </div>
                <div class="info-row">
                  <span class="info-label">CPU已分配</span>
                  <span class="info-value">{{ resourceAllocation.cpu?.allocated || 0 }}<span class="unit">个</span></span>
                </div>
              </div>
            </div>
            <div class="allocation-item">
              <div ref="memoryChart" class="gauge-chart"></div>
              <div class="allocation-info">
                <div class="info-row">
                  <span class="info-label">内存总量</span>
                  <span class="info-value">{{ resourceAllocation.memory?.total || 0 }}<span class="unit">GB</span></span>
                </div>
                <div class="info-row">
                  <span class="info-label">内存已分配</span>
                  <span class="info-value">{{ resourceAllocation.memory?.allocated || 0 }}<span class="unit">GB</span></span>
                </div>
              </div>
            </div>
            <div class="allocation-item">
              <div ref="storageChart" class="gauge-chart"></div>
              <div class="allocation-info">
                <div class="info-row">
                  <span class="info-label">存储总量</span>
                  <span class="info-value">{{ resourceAllocation.storage?.total || 0 }}<span class="unit">TB</span></span>
                </div>
                <div class="info-row">
                  <span class="info-label">存储已分配</span>
                  <span class="info-value">{{ resourceAllocation.storage?.allocated || 0 }}<span class="unit">TB</span></span>
                </div>
              </div>
            </div>
            <div class="allocation-item">
              <div ref="gpuChart" class="gauge-chart"></div>
              <div class="allocation-info">
                <div class="info-row">
                  <span class="info-label">GPU总量</span>
                  <span class="info-value">{{ resourceAllocation.gpu?.total || 0 }}<span class="unit">个</span></span>
                </div>
                <div class="info-row">
                  <span class="info-label">GPU已分配</span>
                  <span class="info-value">{{ resourceAllocation.gpu?.allocated || 0 }}<span class="unit">个</span></span>
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
          <el-table :data="gpuUsageTable1" style="width: 100%; height: calc(100% - 40px)" size="small">
            <el-table-column prop="name" label="姓名" min-width="80" />
            <el-table-column prop="applyCount" label="申请数量" min-width="80" />
            <el-table-column prop="auditCount" label="审核数量" min-width="80" />
            <el-table-column prop="runCount" label="运行数量" min-width="80" />
          </el-table>
        </div>

        <!-- 设备GPU使用量表格2 -->
        <div class="table-card2 card">
          <div class="card-title">设备GPU使用量</div>
          <el-table :data="gpuUsageTable2" style="width: 100%; height: calc(100% - 40px)" size="small">
            <el-table-column prop="name" label="姓名" min-width="80" />
            <el-table-column prop="ip" label="IP" min-width="100" />
            <el-table-column prop="cpu" label="CPU" min-width="60" />
            <el-table-column prop="gpu" label="显卡" min-width="100">
              <template #default="scope">
                {{ scope.row.gpu }}<span class="unit">G</span>
              </template>
            </el-table-column>
            <el-table-column prop="memory" label="内存" min-width="80">
              <template #default="scope">
                {{ scope.row.memory }}<span class="unit">G</span>
              </template>
            </el-table-column>
            <el-table-column prop="machineName" label="机器名称" min-width="120" />
          </el-table>
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
            <div class="phys-value normal">{{ physicalStatus.total || 0 }}</div>
          </div>
          <div class="phys-item">
            <div class="phys-label">异常物理机</div>
            <div class="phys-value warning">{{ physicalStatus.abnormal || 0 }}</div>
          </div>
          <div class="phys-item">
            <div class="phys-label">集群监控状态</div>
            <div class="phys-value normal">{{ physicalStatus.monitorStatus || 0 }}</div>
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
import request from '@/utils/request.js'
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
    time: now.toTimeString().slice(0, 8).replace(/:/g, ' : ')
  }
}

// ========== 资源申请记录数据 ==========
const resourceApply = ref({})

// 从mock接口加载数据
const loadData = async () => {
  try {
    // 调用mock接口
    const result = await request.post('/api/v1/workspace/statisticWorkspace', {})
    
    // 映射mock数据到页面所需的数据结构
    resourceApply.value = {
      totalApply: result.data.totalCreation || 0,
      totalCpu: result.data.totalRequestedCpu || 0,
      totalMemory: result.data.totalRequestedMemory || 0,
      totalStorage: Number(((result.data.totalRequestedDisk || 0) / 1024).toFixed(1)) || 0,   // TB换算
      totalGpu: result.data.totalRequestedGpu || 0
    }
    
    // 根据nodeMetrics计算物理机状态
    const nodeMetrics = result.data.nodeMetrics || []
    const totalNodes = nodeMetrics.length
    const abnormalNodes = nodeMetrics.filter(node => !node.ready).length
    
    physicalStatus.value = {
      total: totalNodes,
      abnormal: abnormalNodes,
      monitorStatus: abnormalNodes === 0 ? 0 : 1
    }
    
    resourceAllocation.value = {
      cpu: {
        total: result.data.cpu || 0,
        allocated: result.data.cpuUsage || 0,
        usageRate: result.data.cpu > 0 ? Math.round((result.data.cpuUsage / result.data.cpu) * 100) : 0
      },
      memory: {
        total: result.data.memory || 0,
        allocated: result.data.memoryUsage || 0,
        usageRate: result.data.memory > 0 ? Math.round((result.data.memoryUsage / result.data.memory) * 100) : 0
      },
      storage: {
        // 换算TB 保留2位小数
        total: Number(((result.data.disk || 0) / 1024).toFixed(2)) || 0,
        allocated: Number(((result.data.diskUsage || 0) / 1024).toFixed(2)) || 0,
        usageRate: result.data.disk > 0 ? Math.round((result.data.diskUsage / result.data.disk) * 100) : 0
      },
      gpu: {
        total: result.data.gpu || 0,
        allocated: result.data.gpuUsage || 0,
        usageRate: result.data.gpu > 0 ? Math.round((result.data.gpuUsage / result.data.gpu) * 100) : 0
      }
    }
    
    // 映射workspaces数据到设备GPU使用量表格2
    gpuUsageTable2.value = (result.data.workspaces || []).map(item => ({
      name: item.userName,
      ip: item.ip,
      cpu: item.cpu,
      gpu: item.gpu,
      memory: item.memory,
      machineName: item.containerId
    }))
    
    // 从nodeMetrics提取设备GPU使用量数据
    const categories = nodeMetrics.flatMap(node => node.accelerators.map(acc => acc.resourceName))
    const requestedList = nodeMetrics.flatMap(node =>
      node.accelerators.map(acc => acc.requested || 0)
    )
    const allocatableList = nodeMetrics.flatMap(node =>
      node.accelerators.map(acc => acc.allocatable || 0)
    )
    gpuUsageData.value = {
      categories,
      data1: requestedList,
      data3: allocatableList
    }
    // 从mock接口获取 gpuUsageTable1 和 trendData
    gpuUsageTable1.value = result.data.gpuUsageTable1 || []
    cpuTrendData.value = result.data.trendData?.cpu || {}
    memoryTrendData.value = result.data.trendData?.memory || {}
    storageTrendData.value = result.data.trendData?.storage || {}
    gpuTrendData.value = result.data.trendData?.gpu || {}
    
    // const response = await fetch('/Workstation.json')
    // const data = await response.json()
    // resourceApply.value = data.resourceApply
    // physicalStatus.value = data.physicalStatus
    // resourceAllocation.value = data.resourceAllocation
    // gpuUsageData.value = data.gpuUsageData
    // gpuUsageTable1.value = data.gpuUsageTable1
    // gpuUsageTable2.value = data.gpuUsageTable2
    
    // 加载折线图数据
    // if (data.trendData) {
    //   cpuTrendData.value = data.trendData.cpu 
    //   memoryTrendData.value = data.trendData.memory 
    //   storageTrendData.value = data.trendData.storage 
    //   gpuTrendData.value = data.trendData.gpu 
    // }
  } catch (error) {
    console.error('Failed to load data:', error)
  }
}

// ========== 物理机状态数据 ==========
const physicalStatus = ref({})

// ========== 资源分配统计数据 ==========
const resourceAllocation = ref({})

// ========== 设备GPU使用量数据（柱状图） ==========
const gpuUsageData = ref({})

// ========== 资源使用率趋势数据 ==========
// const generateTrendData = () => {
//   const times = []
//   const data = []
//   const now = new Date()
//   for (let i = 0; i < 10; i++) {
//     const t = new Date(now.getTime() - (9 - i) * 60000)
//     times.push(t.toTimeString().slice(0, 5))
//     data.push(Math.floor(Math.random() * 40) + 40)
//   }
//   return { times, data }
// }

const cpuTrendData = ref({})
const memoryTrendData = ref({})
const storageTrendData = ref({})
const gpuTrendData = ref({})

// ========== 表格数据 ==========
const gpuUsageTable1 = ref([])
const gpuUsageTable2 = ref([])

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
      axisLabel: { 
        color: '#222222',
        fontSize: 14,
        fontFamily: "PingFang SC",
        fontWeight: 'normal'
      }
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
      axisLabel: { 
        color: '#666666',
        fontSize: 12,
        fontFamily: "PingFang SC",
        fontWeight: 'normal'
      }
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
            { offset: 0, color: '#FFC300' },
            { offset: 1, color: '#FF8B0A' }
          ])
        },
        data: gpuUsageData.value.data1,
      },
      {
        name: '申请-顶圆',
        type: 'pictorialBar',
        silent: true,
        symbolSize: [barWidth, 8],
        symbolOffset: [-11, -4],
        symbolPosition: 'end',
        z: 22,
        color: '#FFEB0D',
        data: gpuUsageData.value.data1,
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
            { offset: 0, color: '#008AFF' },
            { offset: 1, color: '#3C6DCD' }
          ])
        },
        data: gpuUsageData.value.data3,
      },
      {
        name: '运行-顶圆',
        type: 'pictorialBar',
        silent: true,
        symbolSize: [barWidth, 8],
        symbolOffset: [11, -4],
        symbolPosition: 'end',
        z: 22,
        color: '#0df3ff',
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
              fontSize: 13,
              fontWeight: 'bold',
              fontFamily: 'DIN Alternate Bold',
              color: '#222222',
              lineHeight: 16,
              letterSpacing: '-2px'
            },
            name: {
              fontSize: 12,
              color: '#999999',
              fontFamily: "PingFang SC",
              fontWeight: 'normal',
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
      axisLabel: { 
        color: '#222222', 
        fontSize: 12,
        fontFamily: 'PingFang SC Medium',
        fontWeight: 'normal'
      }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#DCDCDCFF', type: 'dashed' } },
      axisLabel: { 
        color: '#666666', 
        fontSize: 12,
        fontFamily: 'PingFang SC Medium',
        fontWeight: 'normal'
      }
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

const updateTrendData = async () => {
  await loadData()
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
              { offset: 0, color: '#FFC300' },
              { offset: 1, color: '#FF8B0A' }
            ])
          },
          data: gpuUsageData.value.data1,
        },
        {
          name: '申请-顶圆',
          type: 'pictorialBar',
          silent: true,
          symbolSize: [barWidth, 10],
          symbolOffset: [-15, -6],
          symbolPosition: 'end',
          z: 22,
          color: '#FFEB0D',
          data: gpuUsageData.value.data1,
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
              { offset: 0, color: '#006caf' },
              { offset: 1, color: '#04f2ff' }
            ])
          },
          data: gpuUsageData.value.data3,
        },
        {
          name: '运行-顶圆',
          type: 'pictorialBar',
          silent: true,
          symbolSize: [barWidth, 10],
          symbolOffset: [15, -6],
          symbolPosition: 'end',
          z: 22,
          color: '#0df3ff',
          data: gpuUsageData.value.data3,
        }
      ]
    })
  }
}

const updateGaugeCharts = () => {
  const max = 5
  const gaugeData = [
    { ref: cpuChart.value, value: resourceAllocation.value.cpu?.usageRate || 0, name: 'CPU', color: '#5470c6' },
    { ref: memoryChart.value, value: resourceAllocation.value.memory?.usageRate || 0, name: '内存', color: '#91cc75' },
    { ref: storageChart.value, value: resourceAllocation.value.storage?.usageRate || 0, name: '存储', color: '#fac858' },
    { ref: gpuChart.value, value: resourceAllocation.value.gpu?.usageRate || 0, name: 'GPU', color: '#ee6666' }
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
                  fontSize: 13,
                  fontWeight: 'bold',
                  fontFamily: 'DIN Alternate Bold',
                  color: '#333',
                  lineHeight: 16
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
  dataRefreshTimer = setInterval(async () => {
    await updateTrendData()
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
onMounted(async () => {
  updateTime()
  timeTimer = setInterval(updateTime, 1000)

  // 加载数据
  await loadData()

  initChart()
  initGpuUsageChart()
  initGaugeChart(cpuChart.value, resourceAllocation.value.cpu?.usageRate || 0, 'CPU', '#5470c6')
  initGaugeChart(memoryChart.value, resourceAllocation.value.memory?.usageRate || 0, '内存', '#91cc75')
  initGaugeChart(storageChart.value, resourceAllocation.value.storage?.usageRate || 0, '存储', '#fac858')
  initGaugeChart(gpuChart.value, resourceAllocation.value.gpu?.usageRate || 0, 'GPU', '#ee6666')

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
  font-size: 18px;
  font-weight: 600;
  font-family: 'PingFang SC Medium', sans-serif;
  font-style: normal;
  color: #222222;
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
  font-weight: 400;
  font-size: 16px;
  font-family: PingFangSC, "PingFang SC", sans-serif;
  line-height: 22px;
  text-align: center;
  font-style: normal;
}

.month-day {
  color: #444444;
  font-size: 16px;
  font-family: PingFangSC, "PingFang SC", sans-serif;
  font-weight: 400;
  line-height: 22px;
  text-align: center;
  font-style: normal;
}

.week {
  color: #444444;
  font-size: 16px;
  font-family: PingFangSC, "PingFang SC", sans-serif;
  font-weight: 400;
  line-height: 22px;
  text-align: center;
  font-style: normal;
}

.time-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.time {
  font-size: 36px;
  font-weight: normal;
  color: #409eff;
  font-family: 'PingFang SC Medium', sans-serif;
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
  font-weight: normal;
  color: #388DEF;
  font-family: 'PingFang SC Medium', sans-serif;
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
  font-weight: normal;
  font-family: 'PingFang SC Medium', sans-serif;
}

.phys-value.normal {
  color: #388DEF;
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
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
}

.info-label {
  color: #999999;
  font-size: 14px;
  font-family: "PingFang SC", sans-serif;
  font-weight: normal;
}

.info-value {
  color: #222222;
  font-size: 24px;
  font-weight: bold !important;
  /* font-family: 'DIN Alternate Bold', sans-serif; */
  letter-spacing: -1px;
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
  font-size: 14px;
  font-family: 'PingFang SC Medium', sans-serif;
  color: #444444;
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

/* el-table 样式 */
.table-card :deep(.el-table),
.table-card2 :deep(.el-table) {
  --el-table-header-bg-color: #F0F0F0 !important;
  --el-table-header-text-color: #222222 !important;
  --el-table-row-hover-bg-color: #f5f7fa !important;
}

.table-card :deep(.el-table th.el-table__cell),
.table-card2 :deep(.el-table th.el-table__cell) {
  font-family: 'PingFang SC Medium', sans-serif !important;
  font-size: 14px !important;
  color: #222222 !important;
  line-height: 41px !important;
  text-align: left !important;
  font-style: normal !important;
  background-color: #F0F0F0 !important;
}

.table-card :deep(.el-table td.el-table__cell),
.table-card2 :deep(.el-table td.el-table__cell) {
  font-family: 'PingFang SC', sans-serif !important;
  font-size: 14px !important;
  color: #222222 !important;
  line-height: 41px !important;
  text-align: left !important;
  font-style: normal !important;
}

.table-card :deep(.el-table .cell),
.table-card2 :deep(.el-table .cell) {
  font-family: inherit !important;
  font-weight: inherit !important;
  font-size: inherit !important;
  color: inherit !important;
  line-height: inherit !important;
  text-align: inherit !important;
  font-style: inherit !important;
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

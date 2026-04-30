<template>
  <div class="mining-task-page">
    <div class="mining-task-top">
      <div class="mining-task-left">
        <!-- 任务列表 -->
        <div class="task-list-content">
          <div v-for="(img, index) in imageList" :key="index" class="task-image-item">
            <el-image
              v-if="img.url"
              :src="img.url"
              class="task-image"
              :preview-src-list="previewSrcList"
              :initial-index="index"
              preview-teleported
            ></el-image>
            <div v-else class="task-image-placeholder">加载中...</div>
          </div>
        </div>
      </div>
      <div class="mining-task-right">
        <!-- 上半部分：模型精度曲线 + 显卡资源使用率 -->
        <div class="right-top-section">
          <!-- 模型精度曲线 -->
          <div class="accuracy-curve-card card">
            <div class="card-title">模型精度曲线</div>
            <div class="chart-content">
              <div ref="accuracyChart" class="chart-container"></div>
            </div>
          </div>

          <!-- 显卡资源使用率 -->
          <div class="gpu-usage-card card">
            <div class="card-title">显卡资源使用率</div>
            <div class="gauge-list">
              <div class="gauge-item">
                <div ref="cpuGaugeChart" class="gauge-chart"></div>
                <div class="gauge-label">CPU</div>
              </div>
              <div class="gauge-item">
                <div ref="gpuGaugeChart" class="gauge-chart"></div>
                <div class="gauge-label">GPU</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 下半部分：模型详情 -->
        <div class="model-detail-card card">
          <div class="card-title">模型详情</div>
          <el-table :data="modelDetailData" style="width: 100%; height: 80px" size="small">
            <el-table-column prop="modelName" label="模型名称" min-width="120" />
            <el-table-column prop="creator" label="创建人" min-width="120" />
            <el-table-column prop="bestAccuracy" label="最佳精度" min-width="100" />
          </el-table>
        </div>
      </div>
    </div>
    <!-- 底部区域：训练列表 -->
    <div class="mining-task-bottom">
      <div class="training-list-card card">
        <div class="card-header">
          <div class="card-title">训练列表</div>
          <el-tooltip content="新增任务" placement="top">
            <button class="add-task-btn" @click="handleAddTask">+</button>
          </el-tooltip>
        </div>
        <el-table :data="trainingListData" style="width: 100%; height: calc(100% - 40px)" size="small"
          :row-class-name="tableRowClassName" @row-click="handleRowClick" :highlight-current-row="true">
          <el-table-column prop="name" label="模型名称" min-width="220" />
          <el-table-column prop="templateName" label="模型" min-width="220" />
          <el-table-column prop="progress" label="进度" min-width="220">
            <template #default="scope">
              {{ getProgressText(scope.row.progress) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" min-width="220">
            <template #default="scope">
              <el-tag :class="getStatusClass(scope.row.status)" size="small">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" min-width="220">
            <template #default="scope">
              {{ formatDate(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="200" fixed="right">
            <template #default="scope">
              <div class="operation-icons" @click.stop>
                <el-tooltip content="详情" placement="top">
                  <img :src="Search" class="op-icon" @click.stop="handleSearch(scope.row, 'info')" />
                </el-tooltip>
                <el-tooltip content="日志" placement="top">
                  <img :src="Edit" class="op-icon" @click.stop="handleSearch(scope.row, 'log')" />
                </el-tooltip>
                <el-tooltip content="TensorBoard" placement="top">
                  <img :src="CopyDocument" class="op-icon" @click.stop="handleSearch(scope.row, 'tensorboard')" />
                </el-tooltip>
                <el-tooltip content="资源使用量" placement="top">
                  <img :src="VideoPlay" class="op-icon" @click.stop="handleSearch(scope.row, 'grafana')" />
                </el-tooltip>
                <el-tooltip content="发布" placement="top">
                  <img :src="Document" class="op-icon" @click.stop="handleSearch(scope.row, 'export')" />
                </el-tooltip>
                <el-tooltip content="样本编辑" placement="top">
                  <img :src="InfoFilled" class="op-icon" @click.stop="handleSearch(scope.row, 'editSample')" />
                </el-tooltip>
                <!-- 取消任务/再训练任务
                <el-tooltip :content="scope.row.isPaused ? '恢复' : '暂停'" placement="top">
                  <img :src="scope.row.isPaused ? pause : recover" class="op-icon" @click="handleRecover(scope.row)" />
                </el-tooltip> -->
                <el-tooltip :content="scope.row.status === 0 ? '取消任务' : '再训练任务'" placement="top">
                  <img :src="scope.row.status === 0 ? pause : recover" class="op-icon"
                    @click.stop="handleSearch(scope.row, scope.row.status === 0 ? 'cancel' : 'resume')" />
                </el-tooltip>


                <el-tooltip content="删除" placement="top">
                  <img :src="Delete" class="op-icon delete" @click.stop="handleSearch(scope.row, 'delete')" />
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import request from '@/utils/request.js'
import Search from "@/assets/table/详情.png"
import Edit from "@/assets/table/日志.png"
import CopyDocument from "@/assets/table/TensorBoard.png"
import VideoPlay from "@/assets/table/监控.png"
import Document from "@/assets/table/发布.png"
import InfoFilled from "@/assets/table/样本编辑.png"
import recover from "@/assets/table/恢复.png"
import pause from "@/assets/table/暂停.png"
import start from "@/assets/table/开始@2x.png"
import stop from "@/assets/table/停止@2x.png"
import Delete from "@/assets/table/删除.png"
import addtask from "@/assets/table/删除.png"
let messenger = null;
let callback = null;
import { getApiToken, redirectToLogin } from '../utils/authToken.js'

// 测试用的 API Token（硬编码）
const TEST_API_TOKEN = 'c6857a62bbc24ef580d96b153837c6e9'

// ========== 模型精度曲线数据 ==========
const accuracyData = ref({})

// ========== 显卡资源使用率数据 ==========
const gpuUsageData = ref({})

// ========== 模型详情表格数据 ==========
const modelDetailData = ref([])

// ========== 训练列表数据 ==========
const trainingListData = ref([])

// ========== 图片列表数据 ==========
const imageList = ref([])

// 预览图片URL列表
const previewSrcList = computed(() => {
  return imageList.value.map(item => item.url).filter(Boolean)
})

// 从真实接口加载数据
const loadData = async () => {
  try {
    // 使用测试用的 API Token
    const token = TEST_API_TOKEN

    if (!token) {
      redirectToLogin('请先登录')
      return
    }
    // 调用训练任务列表查询接口
    const taskListResponse = await fetch('https://ib.cangling.cn:22002/api/v1/sampleDetect/task/queryDetectTaskList', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-TOKEN': token
      },
      body: JSON.stringify({
        "pager": {
          "pageSize": 20,
          "currentPage": 1
        }
      })
    })
    const taskListData = await taskListResponse.json()

    trainingListData.value = taskListData.data?.records || []

    const firstTask = taskListData.data?.records[0]

    if (!firstTask) {
      return
    }

    const taskWithTiles = taskListData.data?.records.find(task => task.id === 36)

    const sampleSetResultId = taskWithTiles?.sampleSetResultId

    const dashboardResponse = await fetch('https://ib.cangling.cn:22002/api/v1/sampleDetect/task/detectTaskDashboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-TOKEN': token
      },
      body: JSON.stringify({
        "id": 36
      })
    })
    const dashboardData = await dashboardResponse.json()

    const sampleTileList = dashboardData.data?.sampleTileList || []

    if (sampleSetResultId && sampleTileList.length > 0) {
      imageList.value = sampleTileList.map(() => ({ url: '' }))

      for (let i = 0; i < sampleTileList.length; i++) {
        const tile = sampleTileList[i]
        const encodedTileId = encodeURIComponent(tile.tileId)
        const imageUrl = `https://ib.cangling.cn:22002/api/v1/map3/sample/thumbnail.webp?sample=${sampleSetResultId}&id=${encodedTileId}&version=0`

        try {
          const imageResponse = await fetch(imageUrl, {
            method: 'GET',
            headers: {
              'API-TOKEN': token
            }
          })

          if (imageResponse.ok) {
            const blob = await imageResponse.blob()
            const url = URL.createObjectURL(blob)
            imageList.value[i].url = url
          } else {
            const errorText = await imageResponse.text()
          }
        } catch (imgError) {
        }
      }
    } else {
    }

    // 映射数据到页面所需的结构
    const accuracyMap = dashboardData.data?.accuracyMap || {}
    const accuracyKeys = Object.keys(accuracyMap)
    const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#C0C4CC']

    if (accuracyKeys.length > 0) {
      accuracyData.value = {
        series: accuracyKeys.map((key, index) => ({
          name: key,
          data: (accuracyMap[key] || []),
          color: colors[index % colors.length]
        })),
        xAxis: {
          data: (accuracyMap[accuracyKeys[0]] || []).map((_, index) => index * 150)
        }
      }
    } else {
      // 提供默认数据结构
      accuracyData.value = {
        series: [],
        xAxis: {
          data: []
        }
      }
    }

    gpuUsageData.value = {
      cpu: {
        value: dashboardData.data?.cpuUsage ? dashboardData.data.cpuUsage * 100 : 0
      },
      gpu: {
        value: dashboardData.data?.gpuUsage ? dashboardData.data.gpuUsage * 100 : 0
      }
    }

    modelDetailData.value = [
      {
        modelName: dashboardData.data?.taskName || '未命名',
        creator: dashboardData.data?.createUsername || '未知',
        bestAccuracy: dashboardData.data?.maxPrecision ? dashboardData.data.maxPrecision * 100 : 0
      }
    ]
  } catch (error) {
  }
}

// 只刷新任务列表（用于操作按钮）
const refreshTaskList = async () => {
  try {
    // 使用测试用的 API Token
    const token = TEST_API_TOKEN
    if (!token) {
      redirectToLogin('请先登录')
      return
    }
    const taskListResponse = await fetch('https://ib.cangling.cn:22002/api/v1/sampleDetect/task/queryDetectTaskList', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-TOKEN': token
      },
      body: JSON.stringify({
        "pager": {
          "pageSize": 20,
          "currentPage": 1
        }
      })
    })
    
    const taskListData = await taskListResponse.json()
    trainingListData.value = taskListData.data?.records || []
  } catch (error) {
  }
}

// 状态标签类型映射
const getStatusType = (status) => {
  const typeMap = {
    '成功': 'success',
    '暂停': 'warning',
    '失败': 'danger'
  }
  return typeMap[status] || 'info'
}

// 状态码转文本
const getStatusText = (status) => {
  const statusMap = {
    0: '运行',
    1: '成功',
    2: '失败',
    3: '暂停'
  }
  return statusMap[status] || '未知'
}

// 进度值转文本
const getProgressText = (progress) => {
  const progressMap = {
    0: '创建完成',
    1: '等待训练',
    2: '训练创建中',
    3: '训练中',
    4: '等待挖掘',
    5: '挖掘创建中',
    6: '挖掘中',
    7: '挖掘结果处理任务等待中',
    8: '挖掘结果处理中'
  }
  return progressMap[progress] || '未知'
}

// 时间格式化函数
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}-${month}-${day}`
}

// 表格单双行样式
const tableRowClassName = ({ rowIndex }) => {
  if (rowIndex % 2 === 0) {
    return 'even-row'
  } else {
    return 'odd-row'
  }
}

const getStatusClass = (status) => {
  const classMap = {
    1: 'status-success',
    3: 'status-pause',
    2: 'status-fail',
    0: 'status-running'
  }
  return classMap[status] || ''
}

// ========== ECharts 实例 ==========
const accuracyChart = ref(null)
const cpuGaugeChart = ref(null)
const gpuGaugeChart = ref(null)

let charts = []

// ========== 图表配置 ==========
const initAccuracyChart = () => {
  const chart = echarts.init(accuracyChart.value)
  const series = accuracyData.value.series || []
  const xAxisData = accuracyData.value.xAxis?.data || []

  //这里设置了一下曲线图幅度
  let allValues = []
  series.forEach(s => {
    if (s.data && s.data.length > 0) {
      allValues = allValues.concat(s.data)
    }
  })

  let yAxisMin = 0
  let yAxisMax = 100

  if (allValues.length > 0) {
    const dataMin = Math.min(...allValues)
    const dataMax = Math.max(...allValues)
    const range = dataMax - dataMin
    const padding = range * 0.1 || 5

    yAxisMin = Math.max(0, Math.floor((dataMin - padding) / 5) * 5)
    yAxisMax = Math.min(100, Math.ceil((dataMax + padding) / 5) * 5)

    if (yAxisMax - yAxisMin < 20) {
      const mid = (yAxisMax + yAxisMin) / 2
      yAxisMin = Math.max(0, Math.floor((mid - 10) / 5) * 5)
      yAxisMax = Math.min(100, Math.ceil((mid + 10) / 5) * 5)
    }
  }




  const option = {
    color: series.map(s => s.color),
    grid: {
      left: '3%',
      right: '4%',
      bottom: '2%',
      top: '10%',
      containLabel: true
    },
    legend: {
      data: series.map(s => s.name),
      left: 'center',
      top: 0,
      textStyle: {
        fontSize: 12,
        color: '#222222',
        fontFamily: 'PingFang SC',
        fontWeight: 'normal'
      },
      // 图例图标样式
      icon: 'rect',
      itemWidth: 10,
      itemHeight: 3
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLine: { lineStyle: { color: '#ccc' } },
      axisLabel: {
        color: '#222222',
        fontSize: 12,
        fontFamily: 'PingFangSC, PingFang SC',
        fontWeight: 'normal',
        lineHeight: 17,
        rotate: xAxisData.length > 8 ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      min: yAxisMin,
      max: yAxisMax,
      interval: Math.ceil((yAxisMax - yAxisMin) / 5),
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#DCDCDCFF', type: 'dashed' } },
      axisLabel: {
        color: '#666666',
        fontSize: 12,
        fontFamily: 'PingFangSC, PingFang SC',
        fontWeight: 'normal',
        lineHeight: 23
      }
    },
    series: series.map(s => ({
      name: s.name,
      type: 'line',
      data: s.data || [],
      smooth: true,
      symbol: 'none',
      lineStyle: { color: s.color, width: 2 }
    }))
  }
  chart.setOption(option)
  charts.push(chart)
}

const initGaugeChart = (chartRef, data) => {
  const chart = echarts.init(chartRef)

  let colorSet = {
    colorBlue: {
      bg: "#D1E8FF",
      bar: '#438DFD',
      pin: "#B7D3FE",
      innerCircle: "#3899FF",
      middleCircle: "#8DC3FD",
      outerCircle: "#E3EDF8"
    }
  };

  let baseColor = colorSet.colorBlue;
  let score = data.value;

  const option = {
    title: {
      text: score + '%',
      left: 'center',
      top: "40%",
      triggerEvent: true,
      textStyle: {
        fontSize: 18,
        fontFamily: "Microsoft YaHei",
        color: '#fff',
      }
    },
    tooltip: { show: false },
    angleAxis: {
      show: false,
      max: (100 * 360) / 265,
      type: "value",
      startAngle: 223,
      splitLine: { show: false },
    },
    barMaxWidth: 4,
    radiusAxis: { show: false, type: "category", z: 10 },
    polar: { radius: "145%" },
    series: [
      {
        type: "bar",
        data: [{ value: score, itemStyle: { color: baseColor.bar } }],
        barGap: "-100%",
        coordinateSystem: "polar",
        roundCap: false,
        z: 2,
        animationDuration: 1500,
      },
      {
        name: '刻度数字',
        type: 'gauge',
        radius: '122%',
        min: 0,
        max: 100,
        splitNumber: 10,
        startAngle: 225,
        endAngle: -45,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          show: true,
          fontSize: 6,
          fontWeight: 'bold',
          color: '#D4D7FA',
          distance: 0,
          formatter: function (value) {
            return value;
          }
        },
        detail: { show: false },
        pointer: { show: false }
      },
      {
        name: '内部蓝色刻度',
        type: 'gauge',
        radius: '120%',
        min: 0,
        max: 100,
        splitNumber: 10,
        startAngle: 225,
        endAngle: -45,
        axisLine: { show: false },
        axisTick: {
          show: true,
          splitNumber: 10,
          lineStyle: { color: baseColor.pin, width: 1 },
          length: -5
        },
        axisLabel: { show: false },
        splitLine: {
          show: true,
          length: -10,
          lineStyle: { width: 2, color: baseColor.pin }
        },
        detail: { show: false },
        pointer: { show: false }
      },
      {
        type: 'pie',
        radius: '65%',
        center: ['50%', '50%'],
        silent: true,
        z: 0,
        itemStyle: {
          color: baseColor.outerCircle,
          borderWidth: 0
        },
        data: [100],
        label: { show: false }
      },
      {
        type: 'pie',
        radius: '60%',
        center: ['50%', '50%'],
        silent: true,
        z: 1,
        itemStyle: {
          color: baseColor.middleCircle,
          borderWidth: 0
        },
        data: [100],
        label: { show: false }
      },
      {
        type: 'pie',
        radius: '55%',
        center: ['50%', '50%'],
        silent: true,
        z: 2,
        itemStyle: {
          color: baseColor.innerCircle,
          borderWidth: 0
        },
        data: [100],
        label: { show: false }
      }
    ]
  };

  chart.setOption(option)
  charts.push(chart)
}

// ========== 数据更新方法 ==========
const updateAccuracyData = (data) => {
  accuracyData.value = { ...accuracyData.value, ...data }
  const chart = charts.find(c => c === echarts.getInstanceByDom(accuracyChart.value))
  if (chart) {
    chart.setOption({
      xAxis: { data: accuracyData.value.xAxis },
      series: accuracyData.value.series.map(s => ({
        name: s.name,
        data: s.data,
        lineStyle: { color: s.color }
      }))
    })
  }
}

const updateGpuUsageData = (data) => {
  gpuUsageData.value = { ...gpuUsageData.value, ...data }
  const cpuChart = charts.find(c => c === echarts.getInstanceByDom(cpuGaugeChart.value))
  const gpuChart = charts.find(c => c === echarts.getInstanceByDom(gpuGaugeChart.value))

  if (cpuChart) {
    cpuChart.setOption({
      title: { text: gpuUsageData.value.cpu.value + '%' },
      series: [
        { data: [{ value: gpuUsageData.value.cpu.value }] },
        {}, {}, {}, {}, {}
      ]
    })
  }
  if (gpuChart) {
    gpuChart.setOption({
      title: { text: gpuUsageData.value.gpu.value + '%' },
      series: [
        { data: [{ value: gpuUsageData.value.gpu.value }] },
        {}, {}, {}, {}, {}
      ]
    })
  }
}

const updateModelDetailData = (data) => {
  modelDetailData.value = data
}

const updateTrainingListData = async () => {
  try {
    const token = getApiToken()
    if (!token) {
      redirectToLogin('请先登录')
      return
    }
    // 调用本地 mock 接口
    const result = await request.post('/api/v1/sampleDetect/task/queryDetectTaskList', {
      "pager": {
        "pageSize": 20,
        "currentPage": 1
      }
    })
    if (result.code !== 200) {
      console.warn('getDashboardStats 错误:', result.message || result.code || '')
      // 检查是否是登录权限错误
      if (result?.message?.includes('需要登录权限')) {
        redirectToLogin('登录已过期，请重新登录')
      }
      return
    }
    if (!result?.success) {
      console.warn('getDashboardStats 失败:', result?.message || '未知错误')
      // 检查是否是登录权限错误
      if (result?.message?.includes('需要登录权限')) {
        redirectToLogin('登录已过期，请重新登录')
      }
      return
    }
    const data = result.data || {}
    console.log(data, 'dataaaaaa')
    if (data.records) {
      trainingListData.value = data.records
    }
  } catch (e) {
    console.warn('getDashboardStats 请求异常', e)
  }
}

const handleRowClick = async (row) => {
  console.log('点击任务:', row)

  const token = getApiToken()
  if (!token) {
    redirectToLogin('请先登录')
    return
  }

  const taskId = row.id
  const sampleSetResultId = row.sampleSetResultId

  console.log('切换到任务:', taskId, 'sampleSetResultId:', sampleSetResultId)

  const dashboardResponse = await fetch('https://ib.cangling.cn:22002/api/v1/sampleDetect/task/detectTaskDashboard', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-TOKEN': token
    },
    body: JSON.stringify({ "id": taskId })
  })

  const dashboardData = await dashboardResponse.json()

  // 更新精度曲线数据
  const accuracyMap = dashboardData.data?.accuracyMap || {}
  const accuracyKeys = Object.keys(accuracyMap)
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#C0C4CC']

  if (accuracyKeys.length > 0) {
    accuracyData.value = {
      series: accuracyKeys.map((key, index) => ({
        name: key,
        data: (accuracyMap[key] || []),
        color: colors[index % colors.length]
      })),
      xAxis: {
        data: (accuracyMap[accuracyKeys[0]] || []).map((_, index) => index * 150)
      }
    }
  } else {
    accuracyData.value = { series: [], xAxis: { data: [] } }
  }

  // 更新GPU使用率数据
  gpuUsageData.value = {
    cpu: { value: dashboardData.data?.cpuUsage ? dashboardData.data.cpuUsage * 100 : 0 },
    gpu: { value: dashboardData.data?.gpuUsage ? dashboardData.data.gpuUsage * 100 : 0 }
  }

  // 更新模型详情数据
  modelDetailData.value = [{
    modelName: dashboardData.data?.taskName || '未命名',
    creator: dashboardData.data?.createUsername || '未知',
    bestAccuracy: dashboardData.data?.maxPrecision ? dashboardData.data.maxPrecision * 100 : 0
  }]

  // 更新图表
  updateAccuracyData(accuracyData.value)
  updateGpuUsageData(gpuUsageData.value)
  updateModelDetailData(modelDetailData.value)

  // 更新图片列表
  const sampleTileList = dashboardData.data?.sampleTileList || []

  if (sampleSetResultId && sampleTileList.length > 0) {
    imageList.value = sampleTileList.map(() => ({ url: '' }))

    for (let i = 0; i < sampleTileList.length; i++) {
      const tile = sampleTileList[i]
      const encodedTileId = encodeURIComponent(tile.tileId)
      const imageUrl = `https://ib.cangling.cn:22002/api/v1/map3/sample/thumbnail.webp?sample=${sampleSetResultId}&id=${encodedTileId}&version=0`

      try {
        const imageResponse = await fetch(imageUrl, {
          method: 'GET',
          headers: { 'API-TOKEN': token }
        })

        if (imageResponse.ok) {
          const blob = await imageResponse.blob()
          imageList.value[i].url = URL.createObjectURL(blob)
        }
      } catch (error) {
      }
    }
  } else {
    imageList.value = []
  }
}

const handleSearch = (row, key) => {
  let data = { "key": key, "taskId": row.id }
  messenger.send('IFRAME_BUTTON', JSON.stringify(data), (res) => {
    console.log(`父页面已响应切换: {"key":"${key}","taskId": ${row.id}}, res: ${res}`);
      // 操作完成后只刷新任务列表
    refreshTaskList()
  });
}

// const handleRecover = (row) => {
//   const key = row.isPaused ? 'resume' : 'pause'
//   let data = { "key": key, "taskId": row.id }
//   messenger.send('IFRAME_BUTTON', JSON.stringify(data), (res) => {
//     console.log(`父页面已响应${key}: {"key":"${key}","taskId": ${row.id}}, res: ${res}`);
//     loadData()
//   });
// }

const handleAddTask = () => {
  let data = { "key": "addTask" }
  messenger.send('IFRAME_BUTTON', JSON.stringify(data), (res) => {
    console.log(`父页面已响应新增任务: {"key":"addTask"}, res: ${res}`);
    // 操作完成后只刷新任务列表
    refreshTaskList()
  });
}


// 暴露方法给父组件
// defineExpose({
//   updateAccuracyData,
//   updateGpuUsageData,
//   updateModelDetailData,
//   updateTrainingListData
// })

// ========== 生命周期 ==========
onMounted(async () => {
  // 加载数据
  await loadData()

  initAccuracyChart()
  initGaugeChart(cpuGaugeChart.value, gpuUsageData.value.cpu)
  initGaugeChart(gpuGaugeChart.value, gpuUsageData.value.gpu)
  // updateTrainingListData()
  window.addEventListener('resize', handleResize)
  // 初始化 SafeMessenger
  messenger = new SafeMessenger({
    targetWindow: window.parent,
    targetOrigin: '*'
  });
   callback = (data) => {
    // addLog(`收到父页面刷新通知`, 'success');
    loadData()
  }
  messenger.on('IFRAME_RELOAD', callback);

})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  charts.forEach(chart => chart.dispose());
  messenger.off('IFRAME_RELOAD', callback);
})

const handleResize = () => {
  charts.forEach(chart => chart.resize())
}
</script>
<style scoped>
.mining-task-page {
  padding: 0 16px;
  background: #f5f7fa;
  width: 1672px;
  height: 1033px;
  display: flex;
  flex-direction: column;
}

.mining-task-top {
  width: 100%;
  height: 570px;
  margin-bottom: 16px;
  display: flex;
}

.mining-task-bottom {
  width: 1640px;
  height: 431px;
}

.training-list-card {
  padding: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-task-btn {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: #409eff;
  color: #fff;
  border: none;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.add-task-btn:hover {
  background: #66b1ff;
}

.operation-icons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.op-icon {
  width: 18px;
  height: 18px;
  cursor: pointer;
  padding: 4px;
  transition: background 0.2s;
  vertical-align: middle;
}

.op-icon:hover {
  background: #ecf5ff;
}

.op-icon.delete {
  color: #f56c6c;
}

.op-icon.delete:hover {
  background: #fef0f0;
}

.mining-task-left {
  width: 979px;
  height: 100%;
  background: #fff;
  padding: 12px;
  display: flex;
  flex-direction: column;
}

.task-list-content {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.task-image-item {
  width: 126.71px;
  height: 126.71px;
  aspect-ratio: 1;
  background: #fff;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.task-image-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.task-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.task-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #909399;
  font-size: 12px;
}


/* 右侧区域样式 */
.mining-task-right {
  display: flex;
  flex-direction: column;
  background: #fff;
}

.right-top-section {
  display: flex;
}

.card {
  background: #fff;
  padding: 16px;
  border: 1px solid #ebeef5;
  box-sizing: border-box;
}

.card-title {
  font-family: PingFangSC, PingFang SC;
  font-weight: 600;
  font-size: 18px;
  color: #222222;
  line-height: 25px;
  text-align: left;
  font-style: normal;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}

/* 模型精度曲线 */
.accuracy-curve-card {
  min-height: 300px;
}

.legend {
  display: flex;
  gap: 16px;
  /* margin-bottom: 8px; */
  font-size: 12px;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  color: #666666;
  line-height: 17px;
  font-style: normal;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
}

.legend-icon {
  display: inline-block;
  width: 20px;
  height: 3px;
  border-radius: 2px;
}

.chart-container {
  height: 280px;
}

/* 显卡资源使用率 */
.gpu-usage-card {
  width: 235px;
  height: 394px;
}

.gauge-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  padding: 10px 0;
}

.gauge-item {
  text-align: center;
}

.gauge-chart {
  width: 150px;
  height: 120px;
}

.gauge-label {
  /* margin-top: 8px; */
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* 模型详情 */
.model-detail-card {
  width: 100%;
  height: 175px;
  overflow: hidden;
}

/* 操作图标样式 */
.op-icon {
  width: 20px;
  height: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
  vertical-align: middle;
}

.op-icon:hover {
  background: #ecf5ff;
}

.op-icon.delete {
  color: #f56c6c;
}

.op-icon.delete:hover {
  background: #fef0f0;
}

/* Element Plus 表格样式 */
:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table tr) {
  height: 40px;
}

:deep(.el-table th) {
  background: #F2F2F2 !important;
  font-family: PingFangSC, PingFang SC;
  font-weight: 600;
  font-size: 14px;
  color: #222222;
  line-height: 41px;
  text-align: left;
  font-style: normal;
  height: 40px;
}

:deep(.el-table td) {
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #222222 !important;
  line-height: 41px;
  text-align: left;
  font-style: normal;
}

:deep(.el-table .even-row) {
  background-color: #FFFFFF;
}

:deep(.el-table .odd-row) {
  background-color: #FAFAFA;
}

/* 状态标签样式 */
:deep(.status-success) {
  width: 48px !important;
  height: 22px !important;
  background: #F7FFFD !important;
  border-radius: 14px !important;
  border: 1px solid #A4E5D6 !important;
  font-family: PingFangSC, PingFang SC !important;
  font-weight: 400 !important;
  font-size: 14px !important;
  color: #33BB9A !important;
  line-height: 20px !important;
  font-style: normal !important;
  padding: 0 8px !important;
}

:deep(.status-pause) {
  width: 48px !important;
  height: 22px !important;
  background: #FFFBE3 !important;
  border-radius: 11px !important;
  border: 1px solid #FFCD6F !important;
  font-family: PingFangSC, PingFang SC !important;
  font-weight: 400 !important;
  font-size: 14px !important;
  color: #FFAB11 !important;
  line-height: 20px !important;
  font-style: normal !important;
  padding: 0 8px !important;
}

:deep(.status-fail) {
  width: 48px !important;
  height: 22px !important;
  background: #FFF8F7 !important;
  border-radius: 11px !important;
  border: 1px solid #FFA59A !important;
  font-family: PingFangSC, PingFang SC !important;
  font-weight: 400 !important;
  font-size: 14px !important;
  color: #FF2929 !important;
  line-height: 20px !important;
  font-style: normal !important;
  padding: 0 8px !important;
}

:deep(.status-running) {
  width: 48px !important;
  height: 22px !important;
  background: #F0F9FF !important;
  border-radius: 11px !important;
  border: 1px solid #91D5FF !important;
  font-family: PingFangSC, PingFang SC !important;
  font-weight: 400 !important;
  font-size: 14px !important;
  color: #1890FF !important;
  line-height: 20px !important;
  font-style: normal !important;
  padding: 0 8px !important;
}

.accuracy-curve-card {
  width: 424px;
  height: 394px;
}

.chart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 43px;
}

/* 隐藏图片预览的放大和旋转按钮 */
:deep(.el-image-viewer__actions) {
  display: none;
}

/* 确保图片预览遮罩层可以正常点击关闭 */
:deep(.el-image-viewer) {
  pointer-events: auto !important;
}

:deep(.el-image-viewer__wrapper) {
  pointer-events: auto !important;
}

:deep(.el-image-viewer__mask) {
  pointer-events: auto !important;
  cursor: pointer;
}
</style>

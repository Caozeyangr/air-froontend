<template>
  <div class="mining-task-page">
    <div class="mining-task-top">
      <div class="mining-task-left">
        <!-- 任务列表 -->
        <div class="task-list-content">
          <!-- 示例图片布局：四行七列 -->
          <div v-for="i in 35" :key="i" class="task-image-item">
            <img src="/src/assets/miningTask/屏幕截图 2026-04-21 111959.png" class="task-image" alt="任务图片"  />
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
        <div class="card-title">训练列表</div>
        <el-table :data="trainingListData" style="width: 100%; height: calc(100% - 40px)" size="small" :row-class-name="tableRowClassName">
          <el-table-column prop="modelName" label="模型名称" min-width="220" />
          <el-table-column prop="modelType" label="模型" min-width="220" />
          <el-table-column prop="progress" label="进度" min-width="220" />
          <el-table-column prop="status" label="状态" min-width="220">
            <template #default="scope">
              <el-tag :class="getStatusClass(scope.row.status)" size="small">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" min-width="220" />
          <el-table-column label="操作" min-width="200" fixed="right">
            <template #default="scope">
              <div class="operation-icons">
                <el-tooltip content="详情" placement="top">
                  <img :src="Search" class="op-icon" @click="handleSearch(scope.row)" />
                </el-tooltip>
                <el-tooltip content="日志" placement="top">
                  <img :src="Edit" class="op-icon" @click="handleEdit(scope.row)" />
                </el-tooltip>
                <el-tooltip content="TensorBoard" placement="top">
                  <img :src="CopyDocument" class="op-icon" @click="handleCopy(scope.row)" />
                </el-tooltip>
                <el-tooltip content="监控" placement="top">
                  <img :src="VideoPlay" class="op-icon" @click="handlePlay(scope.row)" />
                </el-tooltip>
                <el-tooltip content="发布" placement="top">
                  <img :src="Document" class="op-icon" @click="handleDocument(scope.row)" />
                </el-tooltip>
                <el-tooltip content="样本编辑" placement="top">
                  <img :src="InfoFilled" class="op-icon" @click="handleInfo(scope.row)" />
                </el-tooltip>
                <el-tooltip :content="scope.row.isPaused ? '恢复' : '暂停'" placement="top">
                  <img :src="scope.row.isPaused ? pause : recover" class="op-icon" @click="handleRecover(scope.row)" />
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <img :src="Delete" class="op-icon delete" @click="handleDelete(scope.row)" />
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
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import Search from "@/assets/table/详情.png"
import Edit from "@/assets/table/日志.png"
import CopyDocument from "@/assets/table/TensorBoard.png"
import VideoPlay from "@/assets/table/监控.png"
import Document from "@/assets/table/发布.png"
import InfoFilled from "@/assets/table/样本编辑.png"
import recover from "@/assets/table/恢复.png"
import pause from "@/assets/table/暂停.png"
import Delete from "@/assets/table/删除.png"
import miningTaskBg from "@/assets/miningTask/image.png"
let messenger = null;
import { getApiToken, redirectToLogin } from '../utils/authToken.js'

// ========== 模型精度曲线数据 ==========
const accuracyData = ref({})

// ========== 显卡资源使用率数据 ==========
const gpuUsageData = ref({})

// ========== 模型详情表格数据 ==========
const modelDetailData = ref([])

// ========== 训练列表数据 ==========
const trainingListData = ref([])

// 从JSON文件加载数据
const loadData = async () => {
  try {
    const response = await fetch('/MiningTask.json')
    const data = await response.json()
    accuracyData.value = data.accuracyData
    gpuUsageData.value = data.gpuUsageData
    modelDetailData.value = data.modelDetailData
    trainingListData.value = data.trainingListData
  } catch (error) {
    console.error('Failed to load data:', error)
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
    '成功': 'status-success',
    '暂停': 'status-pause',
    '失败': 'status-fail'
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
  const option = {
    color: accuracyData.value.series.map(s => s.color),
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    legend: {
      data: accuracyData.value.series.map(s => s.name),
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
      data: accuracyData.value.xAxis,
      axisLine: { lineStyle: { color: '#ccc' } },
      axisLabel: { 
        color: '#222222', 
        fontSize: 12,
        fontFamily: 'PingFangSC, PingFang SC',
        fontWeight: 'normal',
        lineHeight: 17,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      max: 100,
      interval: 10,
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
    series: accuracyData.value.series.map(s => ({
      name: s.name,
      type: 'line',
      data: s.data,
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
    const response = await fetch('https://ib.cangling.cn:22002/api/v1/sampleDetect/task/queryDetectTaskList', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-TOKEN': token
      },
      body: JSON.stringify({
        "pager": {
          "pageSize": 2,
          "currentPage": 1
        },
        "total": 17,
      })
    })
    const result = await response.json()
    if (!response.ok) {
      console.warn('getDashboardStats HTTP 错误:', response.status, result?.message || result?.code || '')
      // 检查是否是登录权限错误
      if (result?.message?.includes('需要登录权限') || response.status === 401) {
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

const handleSearch = (row) => {
  console.log('查看详情', row)
  messenger.send('IFRAME_BUTTON', { "key": "info", "taskId": 1 }, (res) => {
    console.log(`父页面已响应切换: {"key":"info","taskId": 1}, res: ${res}`);
  });
}

const handleEdit = (row) => {
  console.log('日志', row)
  messenger.send('IFRAME_BUTTON', { "key": "log", "taskId": 1 }, (res) => {
    console.log(`父页面已响应切换: {"key":"log","taskId": 1}, res: ${res}`);
  });
}

const handleCopy = (row) => {
  console.log('tensorboard', row)
  messenger.send('IFRAME_BUTTON', { "key": "tensorboard", "taskId": 1 }, (res) => {
    console.log(`父页面已响应切换: {"key":"tensorboard","taskId": 1}, res: ${res}`);
  });
}

const handlePlay = (row) => {
  console.log('监控', row)
  // 打开资源使用量
  messenger.send('IFRAME_BUTTON', { "key": "monitor", "taskId": 1 }, (res) => {
    console.log(`父页面已响应切换: {"key":"monitor","taskId": 1}, res: ${res}`);
  });
}

const handleDocument = (row) => {
  console.log('发布', row)
  messenger.send('IFRAME_BUTTON', { "key": "export", "taskId": 1 }, (res) => {
    console.log(`父页面已响应切换: {"key":"export","taskId": 1}, res: ${res}`);
  });
}

const handleInfo = (row) => {
  console.log('样本编辑', row)
  messenger.send('IFRAME_BUTTON', { "key": "export", "taskId": 1 }, (res) => {
    console.log(`父页面已响应切换: {"key":"export","taskId": 1}, res: ${res}`);
  });
}

const handleDelete = (row) => {
  console.log('删除', row)
}

const handleRecover = (row) => {
  console.log('恢复/暂停', row)
  row.isPaused = !row.isPaused
  
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
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  charts.forEach(chart => chart.dispose())
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
  padding: 12px ;
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
  height:120px;
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
</style>

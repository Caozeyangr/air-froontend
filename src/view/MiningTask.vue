<template>
  <div class="mining-task-page">
    <div class="mining-task-top">
      <div class="mining-task-left">
        任务列表
      </div>
      <div class="mining-task-right">
        <!-- 上半部分：模型精度曲线 + 显卡资源使用率 -->
        <div class="right-top-section">
          <!-- 模型精度曲线 -->
          <div class="accuracy-curve-card card">
            <div class="card-title">模型精度曲线</div>
            <div class="legend">
              <span class="legend-item">
                <i class="legend-icon" style="background: #5470c6;"></i>YOLOv8
              </span>
              <span class="legend-item">
                <i class="legend-icon" style="background: #fac858;"></i>YOLOv8(改Neck)
              </span>
              <span class="legend-item">
                <i class="legend-icon" style="background: #91cc75;"></i>YOLO-PM
              </span>
            </div>
            <div ref="accuracyChart" class="chart-container"></div>
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
        <el-table :data="trainingListData" style="width: 100%" size="small">
          <el-table-column prop="modelName" label="模型名称" min-width="220" />
          <el-table-column prop="modelType" label="模型" min-width="220" />
          <el-table-column prop="progress" label="进度" min-width="220" />
          <el-table-column prop="status" label="状态" min-width="220">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" min-width="220" />
          <el-table-column label="操作" min-width="200" fixed="right">
            <template #default="scope">
              <div class="operation-icons">
                <img :src="Search" class="op-icon" @click="handleSearch(scope.row)" />
                <img :src="Edit" class="op-icon" @click="handleEdit(scope.row)" />
                <img :src="CopyDocument" class="op-icon" @click="handleCopy(scope.row)" />
                <img :src="VideoPlay" class="op-icon" @click="handlePlay(scope.row)" />
                <img :src="Document" class="op-icon" @click="handleDocument(scope.row)" />
                <img :src="InfoFilled" class="op-icon" @click="handleInfo(scope.row)" />
                <img :src="scope.row.isPaused ? pause : recover" class="op-icon" @click="handleRecover(scope.row)" />
                <img :src="Delete" class="op-icon delete" @click="handleDelete(scope.row)" />
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
let messenger = null;
import { getApiToken, redirectToLogin } from '../utils/authToken.js'

// ========== 模型精度曲线数据 ==========
const accuracyData = ref({
  xAxis: [0, 150, 300, 450, 600, 750, 900, 1050, 1200, 1350, 1500, 1750, 1900],
  series: [
    { name: 'YOLOv8', data: [5, 15, 28, 35, 42, 50, 58, 65, 72, 76, 80, 82, 85], color: '#5470c6' },
    { name: 'YOLOv8(改Neck)', data: [8, 22, 35, 45, 52, 58, 62, 68, 74, 78, 81, 83, 86], color: '#fac858' },
    { name: 'YOLO-PM', data: [3, 12, 25, 32, 40, 48, 55, 62, 70, 78, 82, 84, 87], color: '#91cc75' }
  ]
})

// ========== 显卡资源使用率数据 ==========
const gpuUsageData = ref({
  cpu: { value: 60, name: 'CPU' },
  gpu: { value: 60, name: 'GPU' }
})

// ========== 模型详情表格数据 ==========
const modelDetailData = ref([
  { modelName: '井盖识别', creator: '系统管理员', bestAccuracy: 90 },
  { modelName: '车辆检测', creator: '张三', bestAccuracy: 88 },
  { modelName: '行人识别', creator: '李四', bestAccuracy: 92 }
])

// ========== 训练列表数据 ==========
const trainingListData = ref([
  { modelName: '井盖识别', modelType: 'YOLO26', progress: '训练中', status: '成功', createTime: '2016-3-31', isPaused: false },
  { modelName: '井盖识别', modelType: 'YOLO26', progress: '挖掘中', status: '暂停', createTime: '2016-3-31', isPaused: true },
  { modelName: '井盖识别', modelType: 'YOLO26', progress: '完成', status: '失败', createTime: '2016-3-31', isPaused: false },
  { modelName: '井盖识别', modelType: 'YOLO26', progress: '训练中', status: '成功', createTime: '2016-3-31', isPaused: false },
  { modelName: '井盖识别', modelType: 'YOLO26', progress: '挖掘中', status: '暂停', createTime: '2016-3-31', isPaused: true },
  { modelName: '井盖识别', modelType: 'YOLO26', progress: '完成', status: '失败', createTime: '2016-3-31', isPaused: false },
  { modelName: '井盖识别', modelType: 'YOLO26', progress: '训练中', status: '成功', createTime: '2016-3-31', isPaused: false },
  { modelName: '井盖识别', modelType: 'YOLO26', progress: '训练中', status: '成功', createTime: '2016-3-31', isPaused: false }
])

// 状态标签类型映射
const getStatusType = (status) => {
  const typeMap = {
    '成功': 'success',
    '暂停': 'warning',
    '失败': 'danger'
  }
  return typeMap[status] || 'info'
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
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: accuracyData.value.xAxis,
      axisLine: { lineStyle: { color: '#ccc' } },
      axisLabel: { color: '#666', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#eee', type: 'dashed' } },
      axisLabel: { color: '#666', fontSize: 10 }
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
  const option = {
    series: [{
      type: 'gauge',
      startAngle: 90,
      endAngle: -270,
      radius: '85%',
      pointer: { show: false },
      progress: {
        show: true,
        overlap: false,
        roundCap: true,
        clip: false,
        itemStyle: { color: '#409eff' }
      },
      axisLine: {
        lineStyle: { width: 10, color: [[1, '#e6f2ff']] }
      },
      splitLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      data: [{
        value: data.value,
        name: data.name,
        title: { show: false },
        detail: {
          valueAnimation: true,
          offsetCenter: ['0%', '0%'],
          fontSize: 20,
          fontWeight: 'bold',
          formatter: '{value}%',
          color: '#409eff'
        }
      }]
    }]
  }
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
    cpuChart.setOption({ series: [{ data: [{ value: gpuUsageData.value.cpu.value }] }] })
  }
  if (gpuChart) {
    gpuChart.setOption({ series: [{ data: [{ value: gpuUsageData.value.gpu.value }] }] })
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
onMounted(() => {
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
  padding: 16px;
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
  font-size: 14px;
  font-weight: 600;
  color: #333;
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
  margin-bottom: 12px;
  font-size: 12px;
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
  height: 220px;
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
  width: 120px;
  height: 120px;
}

.gauge-label {
  margin-top: 8px;
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
  background: #f5f7fa;
  color: #666;
  font-weight: 500;
  height: 40px;
}

:deep(.el-table td) {
  color: #333;
}

.accuracy-curve-card {
  width: 424px;
  height: 394px;
}
</style>

<template>
  <div class="sample-statistics-page">
    <!-- 顶部四个统计框 -->
    <div class="statistics-top">
      <!-- 样本库统计 -->
      <div class="statistic-item">
        <div class="statistic-bg">
          <div class="statistic-content">
            <div class="statistic-icon">
              <img src="../assets/sampleStatistics/样本库@2x.png" alt="样本库" />
            </div>
            <div class="statistic-text">
              <div class="text-top">{{ STATISTICS_CARDS[0].value }}<span class="plus">+</span>
                <img :src="STATISTICS_CARDS[0].trend ? upArrow : downArrow" class="arrow-icon" :alt="STATISTICS_CARDS[0].trend ? '上箭头' : '下箭头'" />
              </div>
              <div class="text-bottom">智能解译样本库</div>
            </div>
          </div>
        </div>
      </div>
      <!-- 样本类型统计 -->
      <div class="statistic-item">
        <div class="statistic-bg">
          <div class="statistic-content">
            <div class="statistic-icon">
              <img src="../assets/sampleStatistics/样本类型@2x.png" alt="样本类型" />
            </div>
            <div class="statistic-text">
              <div class="text-top">{{ STATISTICS_CARDS[1].value }}<span class="plus">+</span>
                <img :src="STATISTICS_CARDS[1].trend ? upArrow : downArrow" class="arrow-icon" :alt="STATISTICS_CARDS[1].trend ? '上箭头' : '下箭头'" />
              </div>
              <div class="text-bottom">样本类型</div>
            </div>
          </div>
        </div>
      </div>
      <!-- 标注人员统计 -->
      <div class="statistic-item">
        <div class="statistic-bg">
          <div class="statistic-content">
            <div class="statistic-icon">
              <img src="../assets/sampleStatistics/标注人员@2x.png" alt="标注人员" />
            </div>
            <div class="statistic-text">
              <div class="text-top">{{ STATISTICS_CARDS[2].value }}<span class="plus">+</span>
                <img :src="STATISTICS_CARDS[2].trend ? upArrow : downArrow" class="arrow-icon" :alt="STATISTICS_CARDS[2].trend ? '上箭头' : '下箭头'" />
              </div>
              <div class="text-bottom">标注人员数量</div>
            </div>
          </div>
        </div>
      </div>
      <!-- 存储空间统计 -->
      <div class="statistic-item">
        <div class="statistic-bg">
          <div class="statistic-content">
            <div class="statistic-icon">
              <img src="../assets/sampleStatistics/存储空间@2x.png" alt="存储空间" />
            </div>
            <div class="statistic-text">
              <div class="text-top">{{ STATISTICS_CARDS[3].value }}<span class="plus">+</span>
                <img :src="STATISTICS_CARDS[3].trend ? upArrow : downArrow" class="arrow-icon" :alt="STATISTICS_CARDS[3].trend ? '上箭头' : '下箭头'" />
              </div>
              <div class="text-bottom">占用存储空间</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 下方内容区域 -->
    <div class="statistics-bottom">
      <!-- 左侧区域：样本库和样本类型下方的两个div -->
      <div class="left-section">
        <!-- 样本统计分析卡片 -->
        <div class="bottom-card card-358">
          <div class="card-header">
            <div class="card-title">样本统计分析</div>
            <div class="card-more">查看更多 &gt;</div>
          </div>
          <div class="chart-container">
            <!-- 样本类型分布图表 -->
            <div class="chart-item">
              <div class="chart-title">样本类型分布</div>
              <div ref="typeDistributionChart" class="chart-content"></div>
            </div>
            <!-- 样本数量分布图表 -->
            <div class="chart-item">
              <div class="chart-title">样本数量分布</div>
              <div ref="quantityDistributionChart" class="chart-content"></div>
            </div>
          </div>
        </div>
        <!-- 样本增加趋势卡片 -->
        <div class="bottom-card trend-card">
          <div class="card-header">
            <div class="card-title">样本增加趋势</div>
            <div class="card-more">查看更多 &gt;</div>
          </div>
          <div ref="trendChart" class="trend-chart-content"></div>
        </div>
      </div>
      
      <!-- 右侧区域：标注人员数量和存储空间下方的一个div -->
      <div class="right-section">
        <!-- 样本关联知识图谱卡片 -->
        <div class="bottom-card card-372">
          <div class="card-header">
            <div class="card-title">样本关联知识图谱</div>
          </div>
          <div ref="knowledgeGraph" class="knowledge-graph-container"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import upArrow from '../assets/sampleStatistics/上箭头@2x.png'
import downArrow from '../assets/sampleStatistics/下箭头@2x.png'


// ==================== 提取的数据常量 ====================
// 顶部统计卡片数据（value: 数值, trend: true=上升/上箭头, false=下降/下箭头）
const STATISTICS_CARDS = [
  { value: '100万', trend: true },
  { value: '100万', trend: true },
  { value: '0', trend: false },
  { value: '0', trend: false }
]

// 样本类型分布数据
const TYPE_DISTRIBUTION_DATA = [
  { name: '语义分割', value: 410 },
  { name: '目标检测', value: 280 },
  { name: '变化监测', value: 350 },
  { name: '图文描述', value: 450 },
  { name: '超分', value: 430 }
]

// 样本数量分布（玫瑰图）主体数据
const QUANTITY_MAIN_DATA = [
  { value: 1313, name: '其他' },
  { value: 1750, name: '技术类文档' },
  { value: 1750, name: '图书资料目录' },
  { value: 1969, name: '发文目录' },
  { value: 2188, name: '户籍档案' },
  { value: 2626, name: '专业（业务）档案' },
  { value: 3063, name: '旧文书档案' },
  { value: 3501, name: '收文目录' },
  { value: 3945, name: '文书档案' }
]

// 样本增加趋势数据
const TREND_MONTHS = ['','1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月','']
const TREND_VALUES = [233,111, 233, 333, 543, 546, 765, 444, 225, 664, 775, 886, 996,776]

// ==================== 图表配置函数 ====================
// 获取样本类型分布图表配置
const getTypeDistributionOption = () => {
  const xData = TYPE_DISTRIBUTION_DATA.map(item => item.name)
  const yData = TYPE_DISTRIBUTION_DATA.map(item => item.value)
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: { opacity: 1 }
      },
      formatter: (params) => params[0].name + '：' + params[0].data
    },
    grid: {
      left: '4%',
      top: '15%',
      right: '0%',
      bottom: '5%',
      containLabel: true
    },
    xAxis: [{
      type: 'category',
      gridIndex: 0,
      data: xData,
      axisTick: { show: false },
      axisLine: {
        show: true,
        lineStyle: { color: '#DCDCDC', type: 'solid', width: 1 }
      },
      axisLabel: {
        show: true,
        color: '#222222',
        fontSize: 12,
        fontFamily: 'PingFangSC, PingFang SC',
        fontWeight: 400,
        lineHeight: 18,
        textAlign: 'left',
        fontStyle: 'normal'
      }
    }],
    yAxis: [{
      type: 'value',
      name: '个',
      nameTextStyle: {
        color: '#666666',
        fontSize: 12,
        fontFamily: 'PingFangSC, PingFang SC',
        fontWeight: 400,
        lineHeight: 30,
        textAlign: 'left',
        fontStyle: 'normal',
        padding: [0, 15, -10, 0]
      },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        show: true,
        color: '#666666',
        fontSize: 12,
        fontFamily: 'PingFangSC, PingFang SC',
        fontWeight: 400,
        lineHeight: 30,
        textAlign: 'right',
        fontStyle: 'normal'
      },
      splitLine: {
        show: true,
        lineStyle: { color: 'rgba(220, 220, 220, 1)', width: 1, type: 'dashed' }
      }
    }],
    series: [{
      name: '',
      type: 'bar',
      barWidth: 14.79,
      itemStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 138, 255, 1)' },
            { offset: 1, color: 'rgba(43, 226, 202, 0.03)' }
          ])
        }
      },
      data: yData,
      z: 10,
      zlevel: 2
    }]
  }
}

// 获取样本数量分布图表配置（玫瑰图）
const getQuantityDistributionOption = () => {
  const colorList = [
    { c1: '#c5223b', c2: '#fa768a' },
    { c1: '#de7110', c2: '#fecd70' },
    { c1: '#d09f08', c2: '#FFD145' },
    { c1: '#238483', c2: '#55C27C' },
    { c1: '#45EAFF', c2: '#40ADAC' },
    { c1: '#12B3F8', c2: '#7DE8FF' },
    { c1: '#0176D3', c2: '#13B7FF' },
    { c1: '#015BD3', c2: '#138DFF' },
    { c1: '#7c94e7', c2: '#1e2783' }
  ]
  
  return {
    backgroundColor: '#fff',
    color: ['#EAEA26', '#906BF9', '#FE5656', '#01E17E', '#3DD1F9', '#FFAD05'],
    grid: {
      left: '5%',
      top: '5%',
      bottom: '5%',
      right: '5%',
      containLabel: true
    },
    polar: {},
    angleAxis: {
      interval: 1,
      type: 'category',
      data: [],
      z: 10,
      axisLine: { show: false, lineStyle: { color: '#0B4A6B', width: 1, type: 'solid' } },
      axisLabel: { show: false, interval: 0, color: '#0B4A6B', margin: 8, fontSize: 14 }
    },
    radiusAxis: {
      min: 40,
      max: 120,
      interval: 20,
      axisLine: { show: false },
      axisLabel: {
        formatter: '{value} %',
        show: false,
        padding: [0, 0, 20, 0],
        color: '#0B3E5E',
        fontSize: 16
      },
      splitLine: { show: false, lineStyle: { color: '#F1F8FF', width: 2, type: 'solid' } }
    },
    calculable: true,
    series: [
      {
        type: 'pie',
        radius: ['17%', '18%'],
        hoverAnimation: false,
        labelLine: { normal: { show: false, length: 30, length2: 55 } },
        data: [{ name: '', value: 0, itemStyle: { normal: { color: '#B5CCE7' } }, tooltip: { show: false } }]
      },
      {
        type: 'pie',
        radius: ['80%', '82%'],
        hoverAnimation: false,
        labelLine: { normal: { show: false, length: 30, length2: 55 } },
        name: '',
        data: [{ name: '', value: 0, itemStyle: { normal: { color: '#F1F8FF' } }, tooltip: { show: false } }]
      },
      {
        stack: 'a',
        type: 'pie',
        radius: ['20%', '70%'],
        roseType: 'area',
        zlevel: 10,
        label: {
          normal: {
            show: true,
            formatter: function (param) {
              let style = ''
              // 原样式逻辑保留，未改动
              return '{a|' + param.name + '}\n\n' + '{' + style + param.value + '件 | ' + param.percent + '%}'
            },
            textStyle: { fontSize: 10 },
            rich: {
              a: { color: '#666666', fontSize: '10' },
              s1: { color: '#F25646', fontSize: '10' },
              s2: { color: '#FA971E', fontSize: '10' },
              s3: { color: '#EDC644', fontSize: '10' },
              s4: { color: '#47B17D', fontSize: '10' },
              s5: { color: '#43C9D2', fontSize: '10' },
              s6: { color: '#4BCFFC', fontSize: '10' },
              s7: { color: '#0892E5', fontSize: '10' },
              s8: { color: '#0464DB', fontSize: '7' }
            },
            position: 'outside'
          },
          emphasis: { show: true }
        },
        itemStyle: {
          normal: {
            color: (params) => {
              return new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                { offset: 0, color: colorList[params.dataIndex].c1 },
                { offset: 1, color: colorList[params.dataIndex].c2 }
              ])
            }
          }
        },
        labelLine: {
          normal: { show: true, length: 8, length2: 15, color: '#4BCFFC' },
          emphasis: { show: true }
        },
        data: QUANTITY_MAIN_DATA
      }
    ]
  }
}

// 获取样本增加趋势图表配置
const getTrendChartOption = () => {
  return {
    backgroundColor: '#fff',
    tooltip: {
      trigger: 'axis',
      showContent: false,
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#2697FF',
          width: 1
        }
      }
    },
    grid: {
      left: '1%',
      right: '0%',
      bottom: '1%',
      top: 30,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: TREND_MONTHS,
      axisLabel: {
        color: '#222222',
        fontSize: 14,
        fontFamily: 'PingFangSC, PingFang SC',
        fontWeight: 400,
        margin: 10
      },
      axisLine: {
        lineStyle: {
          color: "#e5e5e5"
        }
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#dadde4',
          type: "dashed"
        }
      },
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: '个',
      nameTextStyle: {
        color: '#666666',
        fontSize: 12,
        fontFamily: 'PingFangSC, PingFang SC',
        fontWeight: 400
      },
      axisLabel: {
        color: '#666666',
        fontSize: 12,
        fontFamily: 'PingFangSC, PingFang SC',
        fontWeight: 400
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#dadde4',
          type: "dashed"
        }
      }
    },
    series: [
        {
      name: '数据',
      type: 'line',
      smooth: true,
      showSymbol: false,
      symbol: 'emptyCircle',
      symbolSize: 10,
      itemStyle: {
        color: '#FFFFFF',
        borderColor: '#2697FF',
        borderWidth: 1
      },
      lineStyle: {
        color: "#2697FF",
        shadowColor: 'rgba(38,151,255,.2)',
        shadowBlur: 6,
        shadowOffsetY: 8
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(38,151,255,.2)' },
          { offset: 1, color: 'rgba(38,151,255,0)' }
        ])
      },
      itemStyle: {
        color: '#2697FF'
      },
      emphasis: {
        symbol: 'emptyCircle',
        symbolSize: 8,
        itemStyle: {
          color: '#fff',
          borderColor: '#2697FF',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'top',
          backgroundColor: '#2697FF',
          color: '#FFFFFF',
          fontSize: 16,
          fontWeight: 500,
          fontFamily: 'PingFang SC, PingFangSC',
          padding: [4, 12, 3, 12],
          borderRadius: 4,
          formatter: '{c}'
        }
      },
      data: TREND_VALUES
    }]
  }
}

// ==================== 知识图谱配置 ====================
const knowledgeGraph = ref(null)
let knowledgeChart = null

const getKnowledgeGraphOption = () => {
  const categories = [
    { name: '核心平台', itemStyle: { color: '#2678ff' } },
    { name: '应用层', itemStyle: { color: '#722ed1' } },
    { name: '边缘层', itemStyle: { color: '#13c2c2' } },
    { name: '算法层', itemStyle: { color: '#2f54eb' } },
    { name: '硬件层', itemStyle: { color: '#fa8c16' } },
    { name: '数据层', itemStyle: { color: '#52c41a' } }
  ]

  const nodes = [
    { name: '江行IDEA平台', category: 0, symbolSize: 80, label: { fontSize: 14 } },
    { name: '智慧应用平台', category: 0, symbolSize: 60 },
    { name: '智能硬件', category: 4, symbolSize: 60 },
    { name: '算法服务', category: 3, symbolSize: 60 },
    { name: '边缘计算层', category: 2, symbolSize: 55 },
    { name: '数据服务', category: 5, symbolSize: 55 },
    { name: 'JCrome EdgeOS', category: 2, symbolSize: 45 },
    { name: 'EdgeBoost', category: 2, symbolSize: 45 },
    { name: 'K3s轻量集群', category: 2, symbolSize: 45 },
    { name: '传感器采集', category: 4, symbolSize: 45 },
    { name: '视频分析', category: 1, symbolSize: 45 },
    { name: '智能预警', category: 1, symbolSize: 45 },
    { name: '远程控制', category: 1, symbolSize: 45 },
    { name: '图像识别算法', category: 3, symbolSize: 45 },
    { name: '目标检测算法', category: 3, symbolSize: 45 },
    { name: '语义分割算法', category: 3, symbolSize: 45 },
    { name: '样本数据库', category: 5, symbolSize: 45 },
    { name: '模型仓库', category: 5, symbolSize: 45 },
    { name: '温度传感器-01', category: 4, symbolSize: 0, label: { show: true, position: 'inside', fontSize: 10, color: '#666' } },
    { name: '湿度传感器-02', category: 4, symbolSize: 0, label: { show: true, position: 'inside', fontSize: 10, color: '#666' } },
    { name: '红外摄像头-03', category: 4, symbolSize: 0, label: { show: true, position: 'inside', fontSize: 10, color: '#666' } },
    { name: '激光雷达-04', category: 4, symbolSize: 0, label: { show: true, position: 'inside', fontSize: 10, color: '#666' } },
    { name: '缺陷检测模型', category: 3, symbolSize: 0, label: { show: true, position: 'inside', fontSize: 10, color: '#666' } },
    { name: '目标追踪模型', category: 3, symbolSize: 0, label: { show: true, position: 'inside', fontSize: 10, color: '#666' } },
    { name: '场景分割模型', category: 3, symbolSize: 0, label: { show: true, position: 'inside', fontSize: 10, color: '#666' } },
    { name: '河流分割样本', category: 5, symbolSize: 0, label: { show: true, position: 'inside', fontSize: 10, color: '#666' } },
    { name: '堤坝识别样本', category: 5, symbolSize: 0, label: { show: true, position: 'inside', fontSize: 10, color: '#666' } },
    { name: '水面垃圾样本', category: 5, symbolSize: 0, label: { show: true, position: 'inside', fontSize: 10, color: '#666' } },
    { name: 'YOLO-v8模型', category: 3, symbolSize: 0, label: { show: true, position: 'inside', fontSize: 10, color: '#666' } },
    { name: 'DeepLabV3+模型', category: 3, symbolSize: 0, label: { show: true, position: 'inside', fontSize: 10, color: '#666' } },
    { name: 'FCN模型文件', category: 3, symbolSize: 0, label: { show: true, position: 'inside', fontSize: 10, color: '#666' } }
  ]

  const links = [
    { source: '江行IDEA平台', target: '智慧应用平台' },
    { source: '江行IDEA平台', target: '智能硬件' },
    { source: '江行IDEA平台', target: '算法服务' },
    { source: '江行IDEA平台', target: '边缘计算层' },
    { source: '江行IDEA平台', target: '数据服务' },
    { source: '智慧应用平台', target: '视频分析' },
    { source: '智慧应用平台', target: '智能预警' },
    { source: '智慧应用平台', target: '远程控制' },
    { source: '智能硬件', target: '传感器采集' },
    { source: '智能硬件', target: 'JCrome EdgeOS' },
    { source: '智能硬件', target: 'EdgeBoost' },
    { source: '智能硬件', target: 'K3s轻量集群' },
    { source: '算法服务', target: '图像识别算法' },
    { source: '算法服务', target: '目标检测算法' },
    { source: '算法服务', target: '语义分割算法' },
    { source: '算法服务', target: '模型仓库' },
    { source: '边缘计算层', target: 'JCrome EdgeOS' },
    { source: '边缘计算层', target: 'EdgeBoost' },
    { source: '边缘计算层', target: 'K3s轻量集群' },
    { source: '数据服务', target: '样本数据库' },
    { source: '数据服务', target: '模型仓库' },
    { source: '传感器采集', target: '温度传感器-01' },
    { source: '传感器采集', target: '湿度传感器-02' },
    { source: '传感器采集', target: '红外摄像头-03' },
    { source: '传感器采集', target: '激光雷达-04' },
    { source: '视频分析', target: '缺陷检测模型' },
    { source: '视频分析', target: '目标追踪模型' },
    { source: '视频分析', target: '场景分割模型' },
    { source: '目标检测算法', target: 'YOLO-v8模型' },
    { source: '语义分割算法', target: 'DeepLabV3+模型' },
    { source: '语义分割算法', target: 'FCN模型文件' },
    { source: '样本数据库', target: '河流分割样本' },
    { source: '样本数据库', target: '堤坝识别样本' },
    { source: '样本数据库', target: '水面垃圾样本' }
  ]

  return {
    backgroundColor: '#fff',
    tooltip: {},
    legend: {
      data: categories.map(c => c.name),
      top: 10,
      textStyle: { color: '#333' }
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        draggable: true,
        roam: true,
        label: {
          show: true,
          position: 'inside',
          fontSize: 12,
          color: '#fff'
        },
        data: nodes,
        links: links,
        categories: categories,
        force: {
          repulsion: 400,
          edgeLength: 80,
          gravity: 0.15
        },
        lineStyle: {
          color: 'source',
          curveness: 0.2
        }
      }
    ]
  }
}

// ==================== 图表挂载 ====================
const typeDistributionChart = ref(null)
const quantityDistributionChart = ref(null)
const trendChart = ref(null)

onMounted(() => {
  if (typeDistributionChart.value) {
    const chart = echarts.init(typeDistributionChart.value)
    chart.setOption(getTypeDistributionOption())
    window.addEventListener('resize', () => chart.resize())
  }
  
  if (quantityDistributionChart.value) {
    const chart = echarts.init(quantityDistributionChart.value)
    chart.setOption(getQuantityDistributionOption())
    window.addEventListener('resize', () => chart.resize())
  }
  
  if (trendChart.value) {
    const chart = echarts.init(trendChart.value)
    chart.setOption(getTrendChartOption())
    window.addEventListener('resize', () => chart.resize())
  }
  
  // 初始化知识图谱
  if (knowledgeGraph.value) {
    knowledgeChart = echarts.init(knowledgeGraph.value)
    knowledgeChart.setOption(getKnowledgeGraphOption())
    window.addEventListener('resize', () => knowledgeChart.resize())
  }
})
</script>

<style scoped>
.sample-statistics-page {
  width: calc(1640px + 32px);
  height: calc(868px + 32px);
  padding: 16px;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
.statistics-top {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
.statistic-item {
  width: 398px;
  height: 120px;
}
.statistic-bg {
  width: 100%;
  height: 100%;
  background-image: url('../assets/sampleStatistics/背景框-4分类@2x.png');
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  padding: 22px 0 20px 39px;
  box-sizing: border-box;
}
.statistic-content {
  display: flex;
  align-items: center;
}
.statistic-icon {
  margin-right: 20px;
}
.statistic-icon img {
  width: 78px;
  height: 78px;
}
.statistic-text {
  width: 137.48px;
  height: 70px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.text-top {
  font-family: 'FZZYJW--GB1', FZZYJW--GB1;
  font-size: 32px;
  color: #444444;
  line-height: 37px;
  text-align: left;
  width: 200px;
}
.text-top .plus {
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
}
.arrow-icon {
  width: 13px;
  height: 17px;
  margin-left: 21px;
  vertical-align: top;
  margin-top: 5px;
}
.text-bottom {
  width: 140px;
  height: 28px;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 20px;
  color: #2e4f72;
  line-height: 28px;
  text-align: left;

}
.statistics-bottom {
  display: flex;
  gap: 16px;
  flex: 1;
}
.left-section {
  width: 812px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.right-section {
  width: 812px;
}
.bottom-card {
  background: #ffffff;
  border-radius: 4px;
  padding: 16px;
  box-sizing: border-box;
}
.card-title {
  font-family: PingFangSC, PingFang SC;
  font-weight: 600;
  font-size: 18px;
  color: #222222;
  line-height: 25px;
  margin-bottom: 0;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.card-more {
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #222222;
  line-height: 20px;
  cursor: pointer;
}
.card-358 {
  height: 358px;
}
.card-372 {
  height: 732px;
}
.chart-container {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 15px;
  flex: 1;
}
.chart-item {
  width: 383px;
  height: 293px;
  background: #ffffff;
  border-radius: 4px;
  border: 2px solid #f0f0f0;
  box-sizing: border-box;
}
.chart-title {
  background: #ffffff;
  padding: 10px 13px;
  font-family: PingFangSC, PingFang SC;
  font-weight: 500;
  font-size: 14px;
  color: #999999;
  line-height: 20px;
}
.chart-content {
  width: 365px;
  height: 240px;
}
.trend-card {
  height: 358px;
  padding: 18px;
}
.trend-chart-content {
  width: 100%;
  height: 281px;
  margin-top: 6px;
}
.knowledge-graph-container {
  width: 100%;
  height: calc(100% - 50px);
}
</style>
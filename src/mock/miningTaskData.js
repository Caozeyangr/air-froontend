import Mock from 'mockjs'

// 模拟训练任务列表查询接口
Mock.mock('/api/v1/sampleDetect/task/queryDetectTaskList', 'post', {
  code: 200,
  message: '操作成功',
  data: {
    pager: {
      total: 4,
      pageSize: 2,
      currentPage: 1
    },
    records: [
      {
        id: 26,
        createTime: '2026-03-23T10:50:32.692+00:00',
        jobId: '-',
        name: '水体挖掘v2',
        epoch: 5,
        maxEpoch: 10,
        sampleSetResultId: 52,
        type: 2,
        describe: '',
        templateName: '分割挖掘mmseg',
        valid: true,
        progress: 5,
        status: 1,
        createUserName: '管理员',
        successNum: 0,
        failNum: 0
      },
      {
        id: 27,
        createTime: '2026-03-23T10:50:32.692+00:00',
        jobId: '-',
        name: '水体挖掘v2',
        epoch: 5,
        maxEpoch: 10,
        sampleSetResultId: 52,
        type: 2,
        describe: '',
        templateName: '分割挖掘mmseg',
        valid: true,
        progress: 7,
        status: 1,
        createUserName: '管理员',
        successNum: 0,
        failNum: 0
      },
      {
        id: 28,
        createTime: '2026-03-23T10:50:32.692+00:00',
        jobId: '-',
        name: '水体挖掘v2',
        epoch: 5,
        maxEpoch: 10,
        sampleSetResultId: 52,
        type: 2,
        describe: '',
        templateName: '分割挖掘mmseg',
        valid: true,
        progress: 2,
        status: 2,
        createUserName: '管理员',
        successNum: 0,
        failNum: 0
      },
      {
        id: 29,
        createTime: '2026-03-23T10:50:32.692+00:00',
        jobId: '-',
        name: '水体挖掘v2',
        epoch: 5,
        maxEpoch: 10,
        sampleSetResultId: 52,
        type: 2,
        describe: '',
        templateName: '分割挖掘mmseg',
        valid: true,
        progress: 3,
        status: 0,
        createUserName: '管理员',
        successNum: 0,
        failNum: 0
      },{
        id: 29,
        createTime: '2026-03-23T10:50:32.692+00:00',
        jobId: '-',
        name: '水体挖掘v2',
        epoch: 5,
        maxEpoch: 10,
        sampleSetResultId: 52,
        type: 2,
        describe: '',
        templateName: '分割挖掘mmseg',
        valid: true,
        progress: 3,
        status: 0,
        createUserName: '管理员',
        successNum: 0,
        failNum: 0
      },{
        id: 29,
        createTime: '2026-03-23T10:50:32.692+00:00',
        jobId: '-',
        name: '水体挖掘v2',
        epoch: 5,
        maxEpoch: 10,
        sampleSetResultId: 52,
        type: 2,
        describe: '',
        templateName: '分割挖掘mmseg',
        valid: true,
        progress: 3,
        status: 3,
        createUserName: '管理员',
        successNum: 0,
        failNum: 0
      },{
        id: 29,
        createTime: '2026-03-23T10:50:32.692+00:00',
        jobId: '-',
        name: '水体挖掘v2',
        epoch: 5,
        maxEpoch: 10,
        sampleSetResultId: 52,
        type: 2,
        describe: '',
        templateName: '分割挖掘mmseg',
        valid: true,
        progress: 3,
        status: 0,
        createUserName: '管理员',
        successNum: 0,
        failNum: 0
      },{
        id: 29,
        createTime: '2026-03-23T10:50:32.692+00:00',
        jobId: '-',
        name: '水体挖掘v2',
        epoch: 5,
        maxEpoch: 10,
        sampleSetResultId: 52,
        type: 2,
        describe: '',
        templateName: '分割挖掘mmseg',
        valid: true,
        progress: 3,
        status: 0,
        createUserName: '管理员',
        successNum: 0,
        failNum: 0
      },{
        id: 29,
        createTime: '2026-03-23T10:50:32.692+00:00',
        jobId: '-',
        name: '水体挖掘v2',
        epoch: 5,
        maxEpoch: 10,
        sampleSetResultId: 52,
        type: 2,
        describe: '',
        templateName: '分割挖掘mmseg',
        valid: true,
        progress: 3,
        status: 0,
        createUserName: '管理员',
        successNum: 0,
        failNum: 0
      },{
        id: 29,
        createTime: '2026-03-23T10:50:32.692+00:00',
        jobId: '-',
        name: '水体挖掘v2',
        epoch: 5,
        maxEpoch: 10,
        sampleSetResultId: 52,
        type: 2,
        describe: '',
        templateName: '分割挖掘mmseg',
        valid: true,
        progress: 3,
        status: 0,
        createUserName: '管理员',
        successNum: 0,
        failNum: 0
      },
    ]
  },
  success: true,
  failed: false
})
// pager 内部为分页信息；currentPage 是当前页 以1开始，pageSize 是页内数量，total为总数；
// records 列表为列表内数据大部分都能看名字知道含义， 
// sampleSetResultId  结果样本集ID
// 需要在样本瓦片获取中填写到sample上


// 模拟挖掘统计信息查询接口
Mock.mock('/api/v1/sampleDetect/task/detectTaskDashboard', 'post', {
  code: 200,
  message: '操作成功',
  data: {
    sampleTileList: [
      {
        tileId: '18%129_GF1_PMS2_E1188_N49.0_20170508_L1A0002347380_Reg_013_009',
        title: '已采信'
      },
      // {
      //   tileId: '18%129_GF1_PMS2_E1188_N49.0_20170508_L1A0002347380_Reg_013_009',
      //   title: '已采信'
      // },
      // {
      //   tileId: '18%129_GF1_PMS2_E1188_N49.0_20170508_L1A0002347380_Reg_013_009',
      //   title: '已采信'
      // },
    ],
    accuracyMap: {
      '精度': [
        0.2,
        0.5,
        0.4,
        0.3,
        0.6,
        0.8,
        0.5,
        0.9
      ],
      '精度2': [
        0.1,
        0.3,
        0.5,
        0.5,
        0.3,
        0.7,
        0.8,
        0.9
      ],
      '精度3': [
        0.2,
        0.3,
        0.2,
        0.8,
        0.6,
        0.7,
        0.4,
        0.9
      ]
    },
    cpuUsage: 0.3,
    gpuUsage: 0.8,
    memoryUsage: 0.5,
    maxPrecision: 0.9,
    taskName: '测试的',
    createUsername: '管理员'
  },
  success: true,
  failed: false
})

// Mock.mock('/api/v1/map3/sample/thumbnail.webp?', 'get', {
//   // 返回图片

// })

Mock.mock(/\/api\/v1\/map3\/sample\/thumbnail\.webp/, 'get', (options) => {
  const url = new URL(options.url, 'http://localhost')
  const sample = url.searchParams.get('sample')
  const id = url.searchParams.get('id')
  const version = url.searchParams.get('version')
  console.log('✅ 样本瓦片请求拦截成功:', { sample, id, version })
  return {
    code: 200,
    message: '操作成功',
    data: null
  }
})


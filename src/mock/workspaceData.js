import Mock from 'mockjs'

// 模拟工作空间统计接口
Mock.mock('/api/v1/workspace/statisticWorkspace', 'post', {
  code: 200,
  message: '操作成功',
  data: {
    workspaces: [{
      userName: "张三",
      cpu: 10,
      gpu: 1,
      memory: 10,
      ip: "127.0.0.1",
      containerId: "node01"
    },
    {
      userName: "李四",
      cpu: 10,
      gpu: 1,
      memory: 10,
      ip: "127.0.0.2",
      containerId: "node02"
    },
    {
      userName: "王五",
      cpu: 10,
      gpu: 1,
      memory: 10,
      ip: "127.0.0.3",
      containerId: "node03"
    },
    {
      userName: "赵六",
      cpu: 10,
      gpu: 1,
      memory: 10,
      ip: "127.0.0.4",
      containerId: "node04"
    },{
      userName: "张三",
      cpu: 10,
      gpu: 1,
      memory: 10,
      ip: "127.0.0.1",
      containerId: "node01"
    },
    {
      userName: "李四",
      cpu: 10,
      gpu: 1,
      memory: 10,
      ip: "127.0.0.2",
      containerId: "node02"
    },
    {
      userName: "王五",
      cpu: 10,
      gpu: 1,
      memory: 10,
      ip: "127.0.0.3",
      containerId: "node03"
    },
    {
      userName: "赵六",
      cpu: 10,
      gpu: 1,
      memory: 10,
      ip: "127.0.0.4",
      containerId: "node04"
    },
  ],
    cpu: 50, // cpu总数
    cpuUsage: 20, // cpu使用量
    memory: 40, // 内存总量 G
    memoryUsage: 20, // 内存使用量 G
    gpu: 8,
    gpuUsage: 5,
    disk: 4000000, // GB
    diskUsage: 200000, // GB
    totalCreation: 100, // 使用总数
    totalRequestedCpu: 10, // 请求总数
    totalRequestedMemory: 1, // 申请内存累计总数 GB
    totalRequestedGpu: 1, // 申请gpu总数
    totalRequestedDisk: 3000, // 申请硬盘总数 GB
    nodeMetrics: [ // 每个节点的详情
      {
        ready: true, // true 表示可以，否则为不可用
        accelerators: [ // 计算资源
          {
            resourceName: "gpu",
            allocatable: 10, // 技术资源总数
            requested: 2 // 分配出去的资源
          }
        ]
      },
      {
        ready: true, // true 表示可以，否则为不可用
        accelerators: [ // 计算资源
          {
            resourceName: "gpu2",
            allocatable: 8, // 技术资源总数
            requested: 5 // 分配出去的资源
          }
        ]
      },
      {
        ready: false, // true 表示可以，否则为不可用
        accelerators: [ // 计算资源
          {
            resourceName: "gpu3",
            allocatable: 7, // 技术资源总数
            requested: 3 // 分配出去的资源
          }
        ]
      },
      
    ],
    // 接口文档没有的
  gpuUsageTable1: [
    { "name": "张三", "applyCount": 4, "auditCount": 4, "runCount": 4 },
    { "name": "张三", "applyCount": 4, "auditCount": 4, "runCount": 4 },
    { "name": "张三", "applyCount": 4, "auditCount": 4, "runCount": 4 },
    { "name": "张三", "applyCount": 4, "auditCount": 4, "runCount": 4 },
    { "name": "张三", "applyCount": 4, "auditCount": 4, "runCount": 4 },
    { "name": "张三", "applyCount": 4, "auditCount": 4, "runCount": 4 },
    { "name": "张三", "applyCount": 4, "auditCount": 4, "runCount": 4 },
    { "name": "张三", "applyCount": 4, "auditCount": 4, "runCount": 4 },
    { "name": "张三", "applyCount": 4, "auditCount": 4, "runCount": 4 },
    { "name": "张三", "applyCount": 4, "auditCount": 4, "runCount": 4 },
    { "name": "张三", "applyCount": 4, "auditCount": 4, "runCount": 4 },
    { "name": "张三", "applyCount": 4, "auditCount": 4, "runCount": 4 },
    { "name": "张三", "applyCount": 4, "auditCount": 4, "runCount": 4 },
    { "name": "张三", "applyCount": 4, "auditCount": 4, "runCount": 4 }
  ],
  trendData: {
    "cpu": {
      "times": ["10:00", "10:01", "10:02", "10:03", "10:04", "10:05", "10:06", "10:07", "10:08", "10:09"],
      "data": [45, 48, 50, 47, 52, 88, 53, 56, 58, 60]
    },
    "memory": {
      "times": ["10:00", "10:01", "10:02", "10:03", "10:04", "10:05", "10:06", "10:07", "10:08", "10:09"],
      "data": [60, 62, 65, 63, 66, 68, 33, 72, 71, 73]
    },
    "storage": {
      "times": ["10:00", "10:01", "10:02", "10:03", "10:04", "10:05", "10:06", "10:07", "10:08", "10:09"],
      "data": [50, 52, 53, 51, 54, 55, 56, 58, 44, 59]
    },
    "gpu": {
      "times": ["10:00", "10:01", "10:02", "10:03", "10:04", "10:05", "10:06", "10:07", "10:08", "10:09"],
      "data": [80, 82, 83, 81, 33, 85, 86, 88, 87, 89]
    }
  },
  },
  
  success: true,
  failed: false
})

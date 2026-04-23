import Mock from 'mockjs'

// 引入接口配置
import './workspaceData.js'
import './miningTaskData.js'

// 设置 mock 响应时间
Mock.setup({
  timeout: '100-300'
})

export default Mock
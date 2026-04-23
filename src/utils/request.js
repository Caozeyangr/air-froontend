import axios from 'axios'
import { getApiToken, redirectToLogin } from './authToken.js'

const service = axios.create({
  baseURL: '',
  timeout: 30000
})

service.interceptors.request.use(
  config => {
    const token = getApiToken()
    if (token) {
      config.headers['API-TOKEN'] = token
    }
    config.headers['Content-Type'] = 'application/json'
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    const res = response.data
    return res
  },
  error => {
    console.error('响应错误:', error)
    
    if (error.response) {
      const { status, data } = error.response
      
      if (status === 401) {
        redirectToLogin('登录已过期，请重新登录')
      } else if (status === 403) {
        console.error('没有权限访问')
      } else if (status === 404) {
        console.error('请求的资源不存在')
      } else if (status === 500) {
        console.error('服务器错误')
      }
    } else if (error.request) {
      console.error('网络错误，请检查网络连接')
    } else {
      console.error('请求配置错误:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default service

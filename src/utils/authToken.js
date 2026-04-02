/**
 * iframe / 外链场景：父页面通过 ?token= 传入鉴权串，需写入 localStorage，
 * 后续 fetch 统一从 getApiToken() 读取并放在请求头 API-TOKEN。
 * 兼容常见拼写错误 ?toekn=
 */
export function getApiToken() {
  return localStorage.getItem('token') || ''
}

/**
 * @param {Record<string, string | string[] | undefined>} query 路由 query
 * @returns {boolean} 是否从 URL 写入了 token
 */
export function applyTokenFromQuery(query) {
  const raw = query?.token ?? query?.toekn
  const token = Array.isArray(raw) ? raw[0] : raw
  if (token == null || String(token).trim() === '') return false
  localStorage.setItem('token', String(token).trim())
  localStorage.setItem('isLoggedIn', 'true')
  return true
}

/**
 * 重定向到登录页面
 * @param {string} reason - 重定向原因
 */
export function redirectToLogin(reason = '') {
  // 清除无效的认证状态
  localStorage.removeItem('token')
  localStorage.removeItem('isLoggedIn')
  
  // 添加重定向原因到URL参数
  let redirectUrl = '/login'
  if (reason) {
    redirectUrl += `?reason=${encodeURIComponent(reason)}`
  }
  
  // 使用Vue Router进行重定向
  window.location.href = redirectUrl
}

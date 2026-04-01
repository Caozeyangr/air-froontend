<template>
  <div class="login-container">
    <div class="login-bg"><img :src="loginBg" alt="登录背景" class="bg-image" /></div>
    <div class="login-form">
      <h2 class="login-title">欢迎登录</h2>
      <div class="input-group">
        <div class="input-icon"><img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2342ACFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E"
            alt="用户" /></div><input 
            type="text" 
            placeholder="请输入用户名" 
            class="login-input"
            :class="{ 'input-error': usernameError }"
            v-model="username"
            @blur="validateUsername"
            @input="clearUsernameError"
          />
        <div v-if="usernameError" class="error-message">{{ usernameError }}</div>
      </div>
      <div class="input-group">
        <div class="input-icon"><img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2342ACFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='11' width='18' height='11' rx='2' ry='2'/%3E%3Cpath d='M7 11V7a5 5 0 0 1 10 0v4'/%3E%3C/svg%3E"
            alt="密码" /></div><input 
            type="password" 
            placeholder="请输入您的密码" 
            class="login-input"
            :class="{ 'input-error': passwordError }"
            v-model="password"
            @blur="validatePassword"
            @input="clearPasswordError"
          />
        <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
      </div><button 
        class="login-button" 
        @click="handleLogin"
        :disabled="isLoading"
      >{{ isLoading ? '登录中...' : '登录' }}</button>
      <div v-if="globalError" class="global-error">{{ globalError }}</div>
    </div>
  </div>
</template>
<script setup>import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import loginBg from '../assets/login/登录背景.png'

const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const usernameError = ref('')
const passwordError = ref('')
const globalError = ref('')

// 用户名验证
const validateUsername = () => {
  if (!username.value.trim()) {
    usernameError.value = '请输入用户名'
    return false
  }
  usernameError.value = ''
  return true
}

// 密码验证
const validatePassword = () => {
  if (!password.value) {
    passwordError.value = '请输入密码'
    return false
  }
  if (password.value.length < 6) {
    passwordError.value = '密码长度至少6位'
    return false
  }
  passwordError.value = ''
  return true
}

// 清除用户名错误
const clearUsernameError = () => {
  usernameError.value = ''
  globalError.value = ''
}

// 清除密码错误
const clearPasswordError = () => {
  passwordError.value = ''
  globalError.value = ''
}

// 表单验证
const validateForm = () => {
  const isUsernameValid = validateUsername()
  const isPasswordValid = validatePassword()
  return isUsernameValid && isPasswordValid
}

// 登录处理
const handleLogin = async () => {
  // 表单验证
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  globalError.value = ''

  try {
    // 模拟登录请求（实际项目中替换为真实API调用）
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 简单的登录验证（实际项目中应使用后端验证）
    if (username.value === 'admin' && password.value === '123456') {
      // 登录成功，保存登录状态
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('username', username.value)
      
      // 获取重定向路径，默认为home
      const redirectPath = route.query.redirect || '/home'
      
      // 跳转到目标页面
      router.push(redirectPath)
    } else {
      globalError.value = '用户名或密码错误'
    }
  } catch (error) {
    console.error('登录失败:', error)
    globalError.value = '登录失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}</script>
<style scoped>
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.login-form {
  position: relative;
  z-index: 2;
  width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  margin-right: 100px;
}

.login-title {
  text-align: center;
  color: #42ACFF;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
}

.input-group {
  position: relative;
  margin-bottom: 20px;
}

.input-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
}

.login-input {
  width: 100%;
  height: 48px;
  padding: 0 15px 0 50px;
  border: 1px solid #42ACFF;
  border-radius: 8px;
  font-size: 16px;
  color: #333;
  background: rgba(255, 255, 255, 0.8);
  outline: none;
  transition: all 0.3s ease;
}

.login-input:focus {
  border-color: #165DFF;
  box-shadow: 0 0 0 2px rgba(66, 172, 255, 0.2);
}

.login-input::placeholder {
  color: #999;
}

.login-input.input-error {
  border-color: #ff4d4f;
}

.error-message {
  color: #ff4d4f;
  font-size: 14px;
  margin-top: 5px;
  margin-left: 50px;
}

.global-error {
  color: #ff4d4f;
  font-size: 14px;
  text-align: center;
  margin-top: 15px;
}

.login-button {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #42ACFF 0%, #165DFF 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.login-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #165DFF 0%, #0D47A1 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(66, 172, 255, 0.4);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-form {
    width: 90%;
    margin-right: 0;
    margin-left: 0;
    padding: 30px 20px;
  }

  .login-title {
    font-size: 20px;
  }

  .login-input {
    height: 44px;
    font-size: 14px;
  }

  .login-button {
    height: 44px;
    font-size: 14px;
  }
}
</style>
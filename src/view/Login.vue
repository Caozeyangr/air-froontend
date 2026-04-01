<template>
  <div class="login-container">
    <div class="login-bg"><img :src="loginBg" alt="登录背景" class="bg-image" /></div>
    <div class="login-form">
      <h2 class="login-title">欢迎登录</h2>
      <div class="input-group">
        <div class="input-icon">
          <img :src="admin" alt="用户" />
        </div>
        <input type="text" placeholder="请输入用户名" class="login-input" :class="{ 'input-error': usernameError }"
          v-model="username" @blur="validateUsername" @input="clearUsernameError" />
        <!-- <div v-if="usernameError" class="error-message">{{ usernameError }}</div> -->
      </div>
      <div class="input-group">
        <div class="input-icon">
          <img :src="paw" alt="密码" />
        </div>
        <input type="password" placeholder="请输入您的密码" class="login-input" :class="{ 'input-error': passwordError }"
          v-model="password" @blur="validatePassword" @input="clearPasswordError" />
        <!-- <div v-if="passwordError" class="error-message">{{ passwordError }}</div> -->
      </div><button class="login-button" @click="handleLogin" :disabled="isLoading">{{ isLoading ? '登录中...' : '登录'
      }}</button>
      <div v-if="globalError" class="global-error">{{ globalError }}</div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import loginBg from '../assets/login/登录背景.png'
import admin from '../assets/login/用户.png'
import paw from '../assets/login/密码.png'
const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const usernameError = ref('')
const passwordError = ref('')
const globalError = ref('')

// --- 加密算法实现 (从iframe中提取) ---
/**
 * @param {string} s 需要加密的字符串
 * @param {number} salt 盐值 (byte)
 */
const encrypt = (s, salt) => {
  // 将字符串转为字节数组 (UTF-8)
  const encoder = new TextEncoder()
  const bytes = encoder.encode(s)

  let temp = ""
  for (let i = 0; i < bytes.length; i++) {
    // Java: bytes[i] ^ (byte)(salt + i)
    // JS 中进行按位异或运算
    let xored = bytes[i] ^ ((salt + i) & 0xFF)

    // 转为 16 进制并补齐 2 位
    let hex = (xored & 0xFF).toString(16)
    if (hex.length === 1) {
      hex = "0" + hex
    }
    temp += hex
  }
  return temp
}

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
    // 1. 执行加密 (使用与iframe相同的盐值)
    const encryptedUser = encrypt(username.value, 0x23)
    const encryptedPass = encrypt(password.value, 0x24)

    // 2. 构造请求参数
    const payload = {
      "userName": encryptedUser,
      "password": encryptedPass,
      "code": "",
      "uuid": "",
      "loginType": "00",
      "pageFrom": "localhost:90"
    }

    // 3. 发送 POST 请求到后端API
    const response = await fetch('https://ib.cangling.cn:22002/api/v1/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()

    if (result.success) {
      // 登录成功，保存登录状态和token
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('username', username.value)
      localStorage.setItem('token', result.data.token)

      // 获取重定向路径，默认为home
      const redirectPath = route.query.redirect || '/home'

      // 跳转到目标页面
      router.push(redirectPath)
    } else {
      globalError.value = '登录失败: ' + (result.msg || '用户名或密码错误')
    }
  } catch (error) {
    console.error('登录失败:', error)
    globalError.value = '请求异常，请确保后端服务已启动'
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
  right: 100px;
  z-index: 2;
  width: 514px;
  padding: 40px;
  font-family: AlimamaShuHeiTi;
}

.login-title {
  text-align: center;
  color: #FFFFFF;
  font-size: 32px;
  font-family: AlimamaShuHeiTi;
  margin-bottom: 54px;
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

  img {
    width: 36px;
    height: 36px;
  }
}

.login-input {
  width: 100%;
  height: 60px;
  padding: 0 15px 0 60px;
  border: 2px solid #FFFFFF;
  border-radius: 8px;
  font-size: 16px;
  color: #333;
  background: linear-gradient(180deg, #F0F8FF 0%, #FFFFFF 100%);
  box-shadow: 0px 3px 10px 0px rgba(176, 199, 233, 0.3), 0px -6px 6px 0px rgba(255, 255, 255, 0.5);
  outline: none;
  transition: all 0.3s ease;
}

.login-input:focus {
  background: linear-gradient( 180deg, #F0F8FF 0%, #FFFFFF 100%);
  box-shadow: 0px 3px 10px 0px rgba(176,199,233,0.3);
  border: 1px solid #1B73FF;
  border-radius: 8px;
}

.login-input::placeholder {
  color: #999;
  border-radius: 8px;
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
  height: 60px;
  background: linear-gradient(93deg, #0B88F9 0%, #34C8FF 100%);
  box-shadow: 0px 10px 19px 0px rgba(0, 157, 255, 0.57);
  border: 1px solid;
  border-image: linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.49)) 1 1;
  border-radius: 36px;
  color: white;
  border: none;
  font-size: 22px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
  font-family: PingFang SC;
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

</style>
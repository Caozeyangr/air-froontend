<template>
  <div class="ai-chat-container">
    <!-- 飞机图标 -->
    <img :src="planeImage" alt="飞机" class="plane-icon" />

    <!-- 输入框区域 -->
    <div class="input-wrapper">
      <div class="input-box">
        <img :src="addImage" alt="添加" class="add-icon" />
        <div class="input-tags-wrapper">
          <!-- 选中的词条标签 -->
          <div v-if="selectedTag" class="selected-tag">
            <span class="selected-tag-text">{{ selectedTag }}</span>
            <span class="selected-tag-delete" @click="removeTag">×</span>
          </div>
          <!-- 输入框 -->
          <input ref="inputRef" v-model="inputText" type="text" :placeholder="!selectedTag ? '与您的AI智能开始对话吧...' : ''"
            class="chat-input" @keyup.enter="handleSearch" />
        </div>
        <img :src="searchImage" alt="搜索" class="search-icon" @click="handleSearch" />
      </div>

      <!-- 快捷词条 -->
      <div class="quick-tags">
        <div v-for="(tag, index) in quickTags" :key="index" class="tag-item"
          :class="{ 'tag-selected': selectedTag === tag }" @click="toggleTag(tag)">
          <span class="tag-text">{{ tag }}</span>
        </div>
        <span class="more-btn">···</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import planeImage from '../assets/header/智能飞机.png'
import addImage from '../assets/header/添加.png'
import searchImage from '../assets/header/搜索.png'
import { getApiToken, redirectToLogin } from '../utils/authToken.js'

const inputText = ref('')
const inputRef = ref(null)

// 快捷词条列表
const quickTags = ref([
  '知识问答',
  '软件使用助手',
  '启动工作流',
  '航空基感智能体'
])

// 选中的词条（单选模式）
const selectedTag = ref(null)

// 切换词条选中状态（单选模式）
function toggleTag(tag) {
  // 如果点击的标签已经选中，则取消选中
  if (selectedTag.value === tag) {
    selectedTag.value = null
  } else {
    // 如果点击的标签未选中，则取消当前选中的标签并选中新标签
    selectedTag.value = tag
  }
}

// 移除选中的词条
function removeTag() {
  selectedTag.value = null
}

// 点击搜索
function handleSearch() {

  const params = `${selectedTag.value ? selectedTag.value + ':' : ''}` + inputText.value
  let token = getApiToken()
  if (!token) {
    redirectToLogin('登录已过期，请重新登录')
    return
  }
  let http = `  https://cangling.cn/cisToken=${token}&question=${params}#/earth-v3.1`
  console.log('搜索参数：', params)
  window.open(http, '_blank')
  // TODO: 调用搜索接口，传递参数
}</script>

<style scoped>
.ai-chat-container {
  /* position: fixed; */
  position: absolute;
  top: 126px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-start;
  gap: 4px;
  z-index: 200;
}

/* 飞机图标 */
.plane-icon {
  width: 60px;
  height: 60px;
  object-fit: contain;
  flex-shrink: 0;
  position: absolute;
  left: -50px;
  top: -10px;
  cursor: pointer;
}

/* 输入框区域 */
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* width: 600px; */
  width: 503px;
}

/* 输入框 */
.input-box {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 503px;
  height: 36px;
  padding: 0 6px 0 12px;
  box-sizing: border-box;
  background: linear-gradient(275deg, #E8F1FF 0%, rgba(255, 255, 255, 0.76) 100%);
  box-shadow: inset 0px 1px 4px 0px rgba(0, 190, 255, 0.59);
  border-radius: 18px;
  border: none;
  opacity: 0.8;
  border-image: none;
}

.add-icon {
  width: 20px;
  height: 20px;
  cursor: pointer;
  flex-shrink: 0;
}

.input-tags-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-height: 28px;
}

.selected-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(66, 172, 255, 0.15);
  border: 1px solid #42ACFF;
  border-radius: 16px;
  font-size: 13px;
  color: #42ACFF;
  white-space: nowrap;
}

.selected-tag-text {
  color: #42ACFF;
}

.selected-tag-delete {
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 77, 79, 0.1);
  border-radius: 50%;
  font-size: 10px;
  color: #ff4d4f;
  cursor: pointer;
  transition: all 0.2s ease;
}

.selected-tag-delete:hover {
  background: rgba(255, 77, 79, 0.2);
}

.chat-input {
  flex: 1;
  width: 167px;
  height: 20px;
  border: none;
  outline: none;
  background: transparent;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #000;
  line-height: 20px;
  text-align: left;
  font-style: normal;
  min-width: 120px;
}

.chat-input::placeholder {
  width: 167px;
  height: 20px;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #B8BCC1;
  line-height: 20px;
  text-align: left;
  font-style: normal;
}

.search-icon {
  width: 27px;
  height: 27px;
  cursor: pointer;
  flex-shrink: 0;
  margin-right: 0;
  position: absolute;
  right: 5px;
}

/* 快捷词条 */
.quick-tags {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 8px;
  justify-content: center;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(66, 172, 255, 0.5);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag-item:hover {
  background: rgba(66, 172, 255, 0.1);
  border-color: #42ACFF;
}

.tag-selected {
  background: rgba(66, 172, 255, 0.2);
  border-color: #42ACFF;
  box-shadow: 0 0 8px rgba(66, 172, 255, 0.4);
}

.tag-text {
  font-size: 13px;
  color: #42ACFF;
  white-space: nowrap;
}



.more-btn {
  padding: 0px 10px;
  font-size: 13px;
  color: #158FFF;
  font-family: PingFang SC;
  font-weight: 400;
  cursor: pointer;
  display: flex;
  text-align: center;
  padding-bottom: 5px;
}
</style>

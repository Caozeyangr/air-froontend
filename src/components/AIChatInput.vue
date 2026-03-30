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
          <div 
            v-for="(tag, index) in selectedTags" 
            :key="index"
            class="selected-tag"
          >
            <span class="selected-tag-text">{{ tag }}</span>
            <span class="selected-tag-delete" @click="removeTag(tag)">×</span>
          </div>
          <!-- 输入框 -->
          <input 
            ref="inputRef"
            v-model="inputText" 
            type="text" 
            :placeholder="selectedTags.length === 0 ? '与您的AI智能开始对话吧...' : ''"
            class="chat-input"
            @keyup.enter="handleSearch"
          />
        </div>
        <img :src="searchImage" alt="搜索" class="search-icon" @click="handleSearch" />
      </div>
      
      <!-- 快捷词条 -->
      <div class="quick-tags">
        <div 
          v-for="(tag, index) in quickTags" 
          :key="index"
          class="tag-item"
          :class="{ 'tag-selected': selectedTags.includes(tag) }"
          @click="toggleTag(tag)"
        >
          <span class="tag-text">{{ tag }}</span>
        </div>
        <span class="more-btn">...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import planeImage from '../assets/header/智能飞机.png'
import addImage from '../assets/header/添加.png'
import searchImage from '../assets/header/搜索.png'

const inputText = ref('')
const inputRef = ref(null)

// 快捷词条列表
const quickTags = ref([
  '知识问答',
  '软件使用助手',
  '启动工作流',
  '航空基感智能体'
])

// 选中的词条列表
const selectedTags = ref([])

// 切换词条选中状态
function toggleTag(tag) {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

// 移除单个选中的词条
function removeTag(tag) {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  }
}

// 点击搜索
function handleSearch() {
  const params = {
    tags: selectedTags.value,
    text: inputText.value
  }
  console.log('搜索参数：', params)
  // TODO: 调用搜索接口，传递参数
  alert('搜索参数：' + JSON.stringify(params))
}
</script>

<style scoped>
.ai-chat-container {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  z-index: 200;
}

/* 飞机图标 */
.plane-icon {
  width: 60px;
  height: 60px;
  object-fit: contain;
  flex-shrink: 0;
}

/* 输入框区域 */
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 600px;
}

/* 输入框 */
.input-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #42ACFF;
  border-radius: 30px;
  box-shadow: 0 4px 20px rgba(66, 172, 255, 0.3);
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
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  min-width: 120px;
}

.chat-input::placeholder {
  color: #999;
}

.search-icon {
  width: 36px;
  height: 36px;
  cursor: pointer;
  flex-shrink: 0;
}

/* 快捷词条 */
.quick-tags {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 8px;
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
  padding: 6px 10px;
  font-size: 14px;
  color: #42ACFF;
  cursor: pointer;
}
</style>

<template>
  <div class="right-panel">
    <ModelLibraryCard :model-count="modelCount"/>
    <ModelLibraryStats :model-count="modelCount" />
    <WorkFlowStats :workflow-list="workflowList" />
  </div>
</template>

<script setup>
defineProps({
  modelCount: {
    type: Number,
    default: 0
  },
  workflowList: {
    type: Array,
    default: () => []
  }
})

import ModelLibraryCard from './ModelLibraryCard.vue'
import ModelLibraryStats from './ModelLibraryStats.vue'
import WorkFlowStats from './WorkFlowStats.vue'
</script>

<style scoped>
.right-panel {
  /* position: fixed; */
  position: absolute;
  /* top: 100px;
  right: 22px; */
  /* 贴近设计稿（图2/3/4）：整体略上移且留出右侧呼吸感 */
  top: 112px;
  right: 18px;
  bottom: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: end;
  gap: 18px;
}
</style>

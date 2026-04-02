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
  top: 100px;
  right: 22px;
  bottom: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: end;
}
</style>

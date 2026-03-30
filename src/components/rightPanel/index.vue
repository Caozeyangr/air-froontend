<template>
  <div class="right-panel">
    <ModelLibraryCard />
    <ModelLibraryStats />
    <WorkFlowStats />
  </div>
</template>

<script setup>
import ModelLibraryCard from './ModelLibraryCard.vue'
import ModelLibraryStats from './ModelLibraryStats.vue'
import WorkFlowStats from './WorkFlowStats.vue'
</script>

<style scoped>
.right-panel {
  position: fixed;
  top: 100px;
  right: 22px;
  bottom: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>

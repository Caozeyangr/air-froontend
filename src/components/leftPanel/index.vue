<template>
  <div class="left-panel">
    <SampleLibraryCard />
    <SampleLibraryStats />
    <ResourceStats />
    <HardwareStats />
  </div>
</template>

<script setup>
import SampleLibraryCard from './SampleLibraryCard.vue'
import SampleLibraryStats from './SampleLibraryStats.vue'
import ResourceStats from './ResourceStats.vue'
import HardwareStats from './HardwareStats.vue'
</script>

<style scoped>
.left-panel {
  position: fixed;
  top: 100px;
  left: 22px;
  bottom: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>

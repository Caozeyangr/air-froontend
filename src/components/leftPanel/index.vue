<template>
  <div class="left-panel">
    <SampleLibraryCard />
    <SampleLibraryStats :sample-set="sampleSet" :sample-count="sampleCount" />
    <ResourceStats
      :gpu="resourceMetrics.gpu"
      :cpu="resourceMetrics.cpu"
      :memory="resourceMetrics.memory"
    />
    <HardwareStats />
  </div>
</template>

<script setup>
defineProps({
  sampleSet: {
    type: Array,
    default: () => []
  },
  sampleCount: {
    type: Number,
    default: 0
  },
  resourceMetrics: {
    type: Object,
    default: () => ({ cpu: 0, memory: 0, gpu: 0 })
  }
})

import SampleLibraryCard from './SampleLibraryCard.vue'
import SampleLibraryStats from './SampleLibraryStats.vue'
import ResourceStats from './ResourceStats.vue'
import HardwareStats from './HardwareStats.vue'
</script>

<style scoped>
.left-panel {
  /* position: fixed; */
  position: absolute;
  /* top: 100px;
  left: 22px; */
  top: 119px; 
  left: 26px;
  bottom: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>

<template>
  <div class="flex items-center gap-3 text-xs text-[var(--ctp-subtext0)]">
    <div class="flex items-center gap-1">
      <Wifi :size="12" class="text-[var(--ctp-green)]" />
      <span>eth0</span>
    </div>
    <span class="text-[var(--ctp-surface0)]">|</span>
    <div class="flex items-center gap-1">
      <Cpu :size="12" class="text-[var(--ctp-blue)]" />
      <span>{{ cpu }}</span>
    </div>
    <span class="text-[var(--ctp-surface0)]">|</span>
    <div class="flex items-center gap-1">
      <MemoryStick :size="12" class="text-[var(--ctp-mauve)]" />
      <span>{{ ram }}</span>
    </div>
    <span class="text-[var(--ctp-surface0)]">|</span>
    <div class="flex items-center gap-1">
      <Volume2 :size="12" class="text-[var(--ctp-teal)]" />
      <span>80%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Wifi, Cpu, MemoryStick, Volume2 } from 'lucide-vue-next'

const cpu = ref('12%')
const ram = ref('4.2G')

let interval: ReturnType<typeof setInterval>

function updateStats() {
  cpu.value = Math.floor(8 + Math.random() * 18) + '%'
  ram.value = (3.8 + Math.random() * 1.4).toFixed(1) + 'G'
}

onMounted(() => {
  updateStats()
  interval = setInterval(updateStats, 3000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      v-for="[id, win] in windows"
      :key="id"
      class="flex items-center gap-1.5 rounded-none px-2.5 py-1 text-[11px] font-medium transition-colors"
      :class="win.minimized
        ? 'text-[var(--ctp-overlay0)] bg-[var(--ctp-surface0)]/30'
        : 'text-[var(--ctp-text)] bg-[var(--ctp-surface0)]/60'"
      @click="onClickWindow(id, win)"
    >
      <span
        class="h-2 w-2 rounded-full"
        :class="win.minimized ? 'bg-[var(--ctp-yellow)]' : 'bg-[var(--ctp-green)]'"
      ></span>
      {{ win.title }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { windowStore, restoreWindow, type WindowEntry } from '../stores/windowStore'

const windows = computed(() => windowStore.windows)

function onClickWindow(id: string, win: WindowEntry) {
  if (win.minimized) {
    restoreWindow(id)
  } else {
    win.focus()
  }
}
</script>

<template>
  <div
    ref="el"
    class="absolute flex flex-col items-center gap-1.5 rounded-lg p-3 no-underline select-none"
    :class="{ 'cursor-grabbing z-50': isDragging, 'cursor-grab z-10': !isDragging }"
    :style="{ left: x + 'px', top: y + 'px' }"
    @mousedown="onMouseDown"
    @click="onClick"
  >
    <span class="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--ctp-surface0)] gradient-border">
      <component :is="iconComponent" :size="20" class="text-[var(--ctp-lavender)]" />
    </span>
    <span class="text-[10px] font-medium text-[var(--ctp-subtext0)]">
      {{ name }}
    </span>
  </div>

  <AppWindow
    ref="appWindow"
    :title="name"
    :originX="x"
    :originY="y"
    @close="windowOpen = false"
    @minimize="windowMinimized = true"
  >
    <DocViewer v-if="name === 'Docs'" />
    <TerminalWindow v-else-if="name === 'Terminal'" />
    <CommandSheet v-else-if="name === 'Commands'" />
    <div v-else class="text-sm text-[var(--ctp-subtext1)]">
      <p class="font-medium text-[var(--ctp-text)] text-lg mb-2">{{ name }}</p>
      <p>Content for {{ name }} goes here.</p>
    </div>
  </AppWindow>
</template>

<script setup lang="ts">
import { BookOpen, SquareTerminal, NotebookPen, CreditCard, ScrollText, ClipboardList, Users, Bookmark, HardDrive, ScanSearch, CloudDownload, ShieldCheck, Rocket, GitFork, Cylinder, BellRing, SlidersHorizontal } from 'lucide-vue-next'
import { ref, computed, onMounted } from 'vue'
import AppWindow from './AppWindow.vue'
import DocViewer from './DocViewer.vue'
import TerminalWindow from './TerminalWindow.vue'
import CommandSheet from './CommandSheet.vue'

const props = defineProps<{
  name: string
  icon: string
  href: string
  initialX: number
  initialY: number
}>()

const iconMap: Record<string, any> = {
  'book-open': BookOpen,
  'square-terminal': SquareTerminal,
  'notebook-pen': NotebookPen,
  'credit-card': CreditCard,
  'scroll-text': ScrollText,
  'clipboard-list': ClipboardList,
  'users': Users,
  'bookmark': Bookmark,
  'hard-drive': HardDrive,
  'scan-search': ScanSearch,
  'download-cloud': CloudDownload,
  'shield-check': ShieldCheck,
  'rocket': Rocket,
  'git-fork': GitFork,
  'cylinder': Cylinder,
  'bell-ring': BellRing,
  'sliders-horizontal': SlidersHorizontal,
}

const iconComponent = computed(() => iconMap[props.icon] || BookOpen)

const el = ref<HTMLElement | null>(null)
const appWindow = ref<InstanceType<typeof AppWindow> | null>(null)
const windowOpen = ref(false)
const windowMinimized = ref(false)
function getSavedPosition() {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem('desktop-icon-positions')
    if (saved) {
      const positions = JSON.parse(saved)
      if (positions[props.name]) return positions[props.name]
    }
  } catch {}
  return null
}

const savedPos = getSavedPosition()
const x = ref(savedPos?.x ?? props.initialX)
const y = ref(savedPos?.y ?? props.initialY)
const isDragging = ref(false)
let hasDragged = false
let startX = 0
let startY = 0
let offsetX = 0
let offsetY = 0

function savePosition() {
  const saved = localStorage.getItem('desktop-icon-positions')
  const positions = saved ? JSON.parse(saved) : {}
  positions[props.name] = { x: x.value, y: y.value }
  localStorage.setItem('desktop-icon-positions', JSON.stringify(positions))
}

function onMouseDown(e: MouseEvent) {
  if (e.button !== 0) return
  e.preventDefault()
  isDragging.value = true
  hasDragged = false
  startX = e.clientX
  startY = e.clientY
  offsetX = e.clientX - x.value
  offsetY = e.clientY - y.value
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e: MouseEvent) {
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
    hasDragged = true
  }
  const iconW = el.value?.offsetWidth || 72
  const iconH = el.value?.offsetHeight || 72
  x.value = Math.max(0, Math.min(e.clientX - offsetX, window.innerWidth - iconW))
  y.value = Math.max(0, Math.min(e.clientY - offsetY, window.innerHeight - iconH))
}

function onMouseUp() {
  isDragging.value = false
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  if (hasDragged) {
    savePosition()
  }
}

function onClick(e: MouseEvent) {
  if (hasDragged) {
    e.preventDefault()
    return
  }
  if (!windowOpen.value) {
    windowOpen.value = true
    windowMinimized.value = false
    appWindow.value?.open()
  } else if (windowMinimized.value) {
    windowMinimized.value = false
    appWindow.value?.open()
  } else {
    // Window is open — bring to front
    appWindow.value?.bringToFront()
  }
}

onMounted(() => {})
</script>

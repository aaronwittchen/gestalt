<template>
  <Teleport v-if="mounted" to="body">
    <Transition name="window">
      <div
        v-if="visible"
        ref="windowEl"
        class="app-window-el fixed flex flex-col rounded-lg select-none"
        :class="isMaximized ? 'inset-2 top-12 rounded-lg' : ''"
        :style="windowStyle"
        @mousedown="bringToFront"
      >
        <div class="absolute inset-0 bg-[var(--ctp-base)] opacity-95 backdrop-blur-xl -z-10 rounded-lg"></div>

        <div
          class="flex items-center justify-between px-3 py-1.5 cursor-move shrink-0 border-b border-[var(--ctp-surface0)]"
          @mousedown="onTitleBarMouseDown"
        >
          <span class="text-[10px] font-medium text-[var(--ctp-overlay1)]">{{ title }}</span>
          <div class="flex items-center gap-2">
            <button
              class="text-[var(--ctp-overlay0)] hover:text-[var(--ctp-yellow)] transition-colors text-xs"
              @click.stop="minimize"
            >&#9472;</button>
            <button
              class="text-[var(--ctp-overlay0)] hover:text-[var(--ctp-green)] transition-colors text-xs"
              @click.stop="toggleMaximize"
            >&#9723;</button>
            <button
              class="text-[var(--ctp-overlay0)] hover:text-[var(--ctp-red)] transition-colors text-xs"
              @click.stop="close"
            >&#10005;</button>
          </div>
        </div>

        <div class="flex-1 overflow-auto p-4">
          <slot />
        </div>

        <div
          v-if="!isMaximized"
          class="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
          @mousedown.stop="onResizeMouseDown"
        ></div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { registerWindow, unregisterWindow, minimizeWindow } from '../stores/windowStore'

const props = defineProps<{
  title: string
  originX: number
  originY: number
  initialWidth?: number
  initialHeight?: number
}>()

const emit = defineEmits<{
  close: []
  minimize: []
}>()

const windowId = `window-${props.title}-${Math.random().toString(36).slice(2, 6)}`

const mounted = ref(false)
const visible = ref(false)
const windowEl = ref<HTMLElement | null>(null)
const isMaximized = ref(false)
const isFocused = ref(false)
const zIndex = ref(40)

const width = ref(props.initialWidth || 600)
const height = ref(props.initialHeight || 400)
const x = ref(0)
const y = ref(0)

const windowStyle = computed(() => {
  const borderColor = isFocused.value ? '2px solid var(--ctp-mauve)' : '2px solid var(--ctp-surface1)'

  if (isMaximized.value) {
    return {
      zIndex: zIndex.value,
      border: borderColor,
    }
  }

  return {
    width: width.value + 'px',
    height: height.value + 'px',
    left: x.value + 'px',
    top: y.value + 'px',
    zIndex: zIndex.value,
    border: borderColor,
    transformOrigin: 'center center',
  }
})

function centerPosition() {
  const jitterX = Math.round((Math.random() - 0.5) * 80)
  const jitterY = Math.round((Math.random() - 0.5) * 60)
  x.value = clamp(
    Math.round((window.innerWidth - width.value) / 2) + jitterX,
    0, window.innerWidth - width.value
  )
  y.value = clamp(
    Math.round((window.innerHeight - height.value) / 2) + jitterY,
    0, window.innerHeight - height.value
  )
}

function bringToFront() {
  isFocused.value = true
  zIndex.value = 50
  document.querySelectorAll('.app-window-el').forEach(el => {
    if (el !== windowEl.value) {
      ;(el as HTMLElement).style.zIndex = '40'
    }
  })
  // Dispatch event so other windows know to unfocus
  window.dispatchEvent(new CustomEvent('window-focused', { detail: windowId }))
}

function open() {
  centerPosition()
  visible.value = true
  bringToFront()

  registerWindow({
    id: windowId,
    title: props.title,
    minimized: false,
    restore,
    focus: bringToFront,
  })
}

function restore() {
  visible.value = true
}

function close() {
  visible.value = false
  unregisterWindow(windowId)
  emit('close')
}

function minimize() {
  visible.value = false
  minimizeWindow(windowId)
  emit('minimize')
}

function toggleMaximize() {
  isMaximized.value = !isMaximized.value
}

// Drag
let dragOffsetX = 0
let dragOffsetY = 0

function onTitleBarMouseDown(e: MouseEvent) {
  bringToFront()
  if (isMaximized.value) return
  dragOffsetX = e.clientX - x.value
  dragOffsetY = e.clientY - y.value
  window.addEventListener('mousemove', onDragMove)
  window.addEventListener('mouseup', onDragEnd)
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(val, max))
}

function onDragMove(e: MouseEvent) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  x.value = clamp(e.clientX - dragOffsetX, 0, vw - width.value)
  y.value = clamp(e.clientY - dragOffsetY, 0, vh - height.value)
}

function onDragEnd() {
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
}

// Resize
let resizeStartX = 0
let resizeStartY = 0
let resizeStartW = 0
let resizeStartH = 0

function onResizeMouseDown(e: MouseEvent) {
  resizeStartX = e.clientX
  resizeStartY = e.clientY
  resizeStartW = width.value
  resizeStartH = height.value
  window.addEventListener('mousemove', onResizeMove)
  window.addEventListener('mouseup', onResizeEnd)
}

function onResizeMove(e: MouseEvent) {
  const maxW = window.innerWidth - x.value
  const maxH = window.innerHeight - y.value
  width.value = clamp(resizeStartW + (e.clientX - resizeStartX), 300, maxW)
  height.value = clamp(resizeStartH + (e.clientY - resizeStartY), 200, maxH)
}

function onResizeEnd() {
  window.removeEventListener('mousemove', onResizeMove)
  window.removeEventListener('mouseup', onResizeEnd)
}

function onWindowFocused(e: Event) {
  const detail = (e as CustomEvent).detail
  if (detail !== windowId) {
    isFocused.value = false
  }
}

onMounted(() => {
  mounted.value = true
  window.addEventListener('window-focused', onWindowFocused)
})

onUnmounted(() => {
  unregisterWindow(windowId)
  window.removeEventListener('window-focused', onWindowFocused)
})

defineExpose({ open, close, minimize, bringToFront })
</script>

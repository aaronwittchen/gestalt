<template>
  <div class="relative">
    <button
      class="info-trigger"
      @click.stop="open = !open"
    >
      ?
    </button>

    <Transition name="info-panel">
      <div
        v-if="open"
        ref="panel"
        class="info-panel subtle-border"
      >
        <div class="info-header">
          <span>About Gestalt</span>
          <button class="info-close" aria-label="Close" @click.stop="open = false">
            <X :size="14" />
          </button>
        </div>
        <div class="info-body">
          <p class="info-label">Built with</p>
          <div class="info-list">
            <button
              v-for="item in techStack"
              :key="item.name"
              class="info-row"
              @click.stop="openLink(item.url)"
            >
              <Icon :icon="item.icon" :width="18" :height="18" :style="{ color: item.color }" />
              <span>{{ item.name }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import { X } from 'lucide-vue-next'

const open = ref(false)
const panel = ref<HTMLElement | null>(null)

const techStack = [
  { name: 'Astro', icon: 'simple-icons:astro', color: '#FF5D01', url: 'https://astro.build/' },
  { name: 'Vue', icon: 'simple-icons:vuedotjs', color: '#4FC08D', url: 'https://vuejs.org/' },
  { name: 'MDX', icon: 'simple-icons:mdx', color: '#FCB32C', url: 'https://mdxjs.com/' },
  { name: 'Bun', icon: 'simple-icons:bun', color: '#FBF0DF', url: 'https://bun.com/' },
  { name: 'Tailwind CSS', icon: 'simple-icons:tailwindcss', color: '#06B6D4', url: 'https://tailwindcss.com/' },
  { name: 'Lucide', icon: 'simple-icons:lucide', color: '#F56565', url: 'https://lucide.dev/icons/' },
  { name: 'Catppuccin', icon: 'simple-icons:catppuccin', color: '#EBA0AC', url: 'https://catppuccin.com/' },
]

function openLink(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

function onClickOutside(e: MouseEvent) {
  if (panel.value && !panel.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.info-trigger {
  font-size: 12px;
  color: var(--ctp-subtext0);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s;
}

.info-trigger:hover {
  color: var(--ctp-text);
}

.info-panel {
  position: fixed;
  bottom: 3rem;
  right: 1rem;
  width: 280px;
  background: var(--ctp-bg-panel);
  border-radius: 0;
  z-index: 999;
  box-shadow: var(--ctp-shadow-lg);
}

.info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 1rem;
  font-size: 12px;
  font-weight: 600;
  color: var(--ctp-text);
  border-bottom: 1px solid color-mix(in srgb, var(--ctp-surface0), transparent 40%);
}

.info-close {
  background: none;
  border: none;
  color: var(--ctp-overlay0);
  cursor: pointer;
  padding: 0;
  display: flex;
  transition: color 0.15s;
}

.info-close:hover {
  color: var(--ctp-text);
}

.info-body {
  padding: 0.75rem 1rem;
}

.info-label {
  font-size: 10px;
  color: var(--ctp-subtext0);
  margin-bottom: 0.625rem;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.4rem 0.625rem;
  font-size: 12px;
  color: var(--ctp-subtext1);
  background: none;
  border: none;
  border-radius: 0;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: background 0.15s, color 0.15s;
}

.info-row:hover {
  background: var(--ctp-surface0);
  color: var(--ctp-text);
}

.info-panel-enter-active,
.info-panel-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.info-panel-enter-from,
.info-panel-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>

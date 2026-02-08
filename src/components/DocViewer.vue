<template>
  <div class="flex flex-1 min-h-0 -m-5">
    <!-- Sidebar -->
    <aside
      class="shrink-0 bg-[var(--ctp-bg-panel)] overflow-y-auto transition-all duration-200"
      :class="sidebarOpen ? 'w-52 p-4' : 'w-8 p-1'"
      style="border-right: var(--ctp-border-subtle);"
    >
      <button
        class="flex items-center justify-center w-6 h-6 rounded-none text-[var(--ctp-overlay0)] hover:text-[var(--ctp-text)] hover:bg-[var(--ctp-surface0)]/50 transition-colors mb-2"
        @click="sidebarOpen = !sidebarOpen"
      >
        <span class="text-xs">{{ sidebarOpen ? '◂' : '▸' }}</span>
      </button>
      <template v-if="sidebarOpen">
        <div class="text-[10px] font-semibold text-[var(--ctp-overlay0)] uppercase tracking-wider mb-2 px-3">Docs</div>
        <ul class="flex flex-col gap-0.5">
          <li v-for="doc in docs" :key="doc.id">
            <button
              class="w-full text-left rounded-none px-3 py-2 text-xs font-medium transition-colors"
              :class="activeDoc === doc.id
                ? 'text-[var(--ctp-text)] bg-[var(--ctp-surface0)]/60'
                : 'text-[var(--ctp-subtext0)] hover:text-[var(--ctp-text)] hover:bg-[var(--ctp-surface0)]/40'"
              @click="activeDoc = doc.id"
            >
              {{ doc.title }}
            </button>
          </li>
        </ul>
      </template>
    </aside>
    <!-- Content -->
    <main class="flex-1 overflow-y-auto p-6">
      <div class="prose-gestalt" v-html="activeContent"></div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface DocEntry {
  id: string
  title: string
  html: string
}

const docs = ref<DocEntry[]>([])
const activeDoc = ref('')
const sidebarOpen = ref(true)

const activeContent = computed(() => {
  const doc = docs.value.find(d => d.id === activeDoc.value)
  return doc?.html || ''
})

onMounted(() => {
  const els = document.querySelectorAll('[id^="doc-content-"]')
  const entries: DocEntry[] = []
  els.forEach(el => {
    const id = el.id.replace('doc-content-', '')
    const title = el.getAttribute('data-doc-title') || id
    entries.push({ id, title, html: el.innerHTML })
  })
  docs.value = entries
  if (entries.length > 0) {
    activeDoc.value = entries[0].id
  }
})
</script>

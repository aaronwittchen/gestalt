<template>
  <div
    ref="container"
    class="flex flex-col h-full bg-[var(--ctp-crust)] text-[13px] outline-none"
    style="font-family: var(--ctp-font-mono);"
    tabindex="0"
    @keydown="handleKeydown"
    @click="container?.focus()"
  >
    <!-- Main content area -->
    <div class="flex-1 overflow-hidden min-h-0">
      <!-- Netrw view -->
      <div v-if="mode === 'netrw'" ref="netrwEl" class="h-full overflow-y-auto p-0">
        <div class="text-[var(--ctp-overlay0)] px-2 pt-1 select-none">
          <div>" ====== netrw ======</div>
          <div>" {{ currentDir === '' ? '/' : '/' + currentDir }}</div>
          <div>&nbsp;</div>
        </div>
        <div
          v-for="(entry, i) in directoryEntries"
          :key="entry.path"
          class="px-2 cursor-pointer select-none"
          :class="i === cursorLine ? 'bg-[var(--ctp-surface0)]' : ''"
          @click="cursorLine = i; openEntry()"
        >
          <span v-if="entry.isDir" class="text-[var(--ctp-blue)]">{{ entry.name }}/</span>
          <span v-else class="text-[var(--ctp-text)]">{{ entry.name }}</span>
        </div>
      </div>

      <!-- File view -->
      <div v-else-if="mode === 'file'" ref="fileEl" class="h-full overflow-y-auto">
        <div v-if="loading" class="p-4 text-[var(--ctp-overlay0)]">Loading...</div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-else class="file-content" v-html="renderedHtml" />
      </div>
    </div>

    <!-- Status line -->
    <div class="flex-shrink-0 bg-[var(--ctp-surface0)] px-2 py-0.5 flex justify-between select-none">
      <template v-if="commandMode">
        <span class="text-[var(--ctp-text)]">:{{ commandBuffer }}</span>
      </template>
      <template v-else-if="mode === 'netrw'">
        <span class="text-[var(--ctp-text)]">-- NETRW --</span>
        <span class="text-[var(--ctp-overlay0)]">/{{ currentDir || '' }}</span>
      </template>
      <template v-else>
        <span class="text-[var(--ctp-text)]">{{ currentFile }}</span>
        <span class="text-[var(--ctp-overlay0)]">{{ fileLineCount }} lines -- NORMAL --</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { createHighlighter, type Highlighter } from 'shiki'

const props = defineProps<{
  initialFile?: string
}>()

const emit = defineEmits<{
  quit: []
}>()

// --- File data from import.meta.glob ---
const rawFiles: Record<string, { default: string }> = import.meta.glob(
  [
    '/src/**/*.{vue,ts,astro,css,mdx,mjs}',
    '/astro.config.mjs',
    '/package.json',
    '/tsconfig.json',
    '/todo.md',
  ],
  { query: '?raw', eager: true }
)

// Normalize paths: strip leading /
const files: Record<string, string> = {}
for (const [path, mod] of Object.entries(rawFiles)) {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  files[normalizedPath] = mod.default
}

// --- File tree building ---
interface TreeEntry {
  name: string
  path: string
  isDir: boolean
}

function getEntriesForDir(dir: string): TreeEntry[] {
  const prefix = dir === '' ? '' : dir + '/'
  const seen = new Set<string>()
  const entries: TreeEntry[] = []

  for (const filePath of Object.keys(files)) {
    if (!filePath.startsWith(prefix)) continue
    const rest = filePath.slice(prefix.length)
    const slashIdx = rest.indexOf('/')
    if (slashIdx === -1) {
      // File in this directory
      if (!seen.has(rest)) {
        seen.add(rest)
        entries.push({ name: rest, path: filePath, isDir: false })
      }
    } else {
      // Subdirectory
      const dirName = rest.slice(0, slashIdx)
      if (!seen.has(dirName)) {
        seen.add(dirName)
        entries.push({ name: dirName, path: prefix + dirName, isDir: true })
      }
    }
  }

  // Sort: directories first, then files, alphabetically
  entries.sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  // Add parent directory entry if not at root
  if (dir !== '') {
    entries.unshift({ name: '..', path: '..', isDir: true })
  }

  return entries
}

// --- State ---
const mode = ref<'netrw' | 'file'>('netrw')
const currentDir = ref('')
const cursorLine = ref(0)
const currentFile = ref('')
const commandMode = ref(false)
const commandBuffer = ref('')
const loading = ref(false)
const renderedHtml = ref('')
const fileLineCount = ref(0)
const container = ref<HTMLElement | null>(null)
const netrwEl = ref<HTMLElement | null>(null)
const fileEl = ref<HTMLElement | null>(null)

let highlighter: Highlighter | null = null

const directoryEntries = computed(() => getEntriesForDir(currentDir.value))

// --- Shiki highlighter ---
const langMap: Record<string, string> = {
  vue: 'vue',
  ts: 'typescript',
  tsx: 'tsx',
  js: 'javascript',
  jsx: 'jsx',
  mjs: 'javascript',
  astro: 'astro',
  css: 'css',
  md: 'markdown',
  mdx: 'mdx',
  json: 'json',
  html: 'html',
}

function getLang(filePath: string): string {
  const ext = filePath.split('.').pop() || ''
  return langMap[ext] || 'text'
}

async function initHighlighter() {
  if (highlighter) return
  highlighter = await createHighlighter({
    themes: ['catppuccin-mocha'],
    langs: ['vue', 'typescript', 'javascript', 'astro', 'css', 'markdown', 'mdx', 'json', 'html', 'tsx', 'jsx'],
  })
}

async function renderFile(filePath: string) {
  loading.value = true
  const content = files[filePath]
  if (!content) {
    renderedHtml.value = '<div class="p-4 text-[var(--ctp-red)]">File not found</div>'
    fileLineCount.value = 0
    loading.value = false
    return
  }

  fileLineCount.value = content.split('\n').length

  await initHighlighter()

  const lang = getLang(filePath)
  const html = highlighter!.codeToHtml(content, {
    lang,
    theme: 'catppuccin-mocha',
  })

  renderedHtml.value = html
  loading.value = false

  nextTick(() => {
    fileEl.value?.scrollTo(0, 0)
  })
}

// --- Navigation ---
function openEntry() {
  const entry = directoryEntries.value[cursorLine.value]
  if (!entry) return

  if (entry.isDir) {
    if (entry.name === '..') {
      // Go up
      const parts = currentDir.value.split('/')
      parts.pop()
      currentDir.value = parts.join('/')
    } else {
      currentDir.value = entry.path
    }
    cursorLine.value = 0
  } else {
    // Open file
    currentFile.value = entry.path
    mode.value = 'file'
    renderFile(entry.path)
  }
}

function goUpDir() {
  if (mode.value === 'file') {
    // Go back to netrw
    mode.value = 'netrw'
    cursorLine.value = 0
    return
  }
  if (currentDir.value === '') return
  const parts = currentDir.value.split('/')
  parts.pop()
  currentDir.value = parts.join('/')
  cursorLine.value = 0
}

// --- Keyboard handling ---
function handleKeydown(e: KeyboardEvent) {
  // Always stop propagation so parent components don't interfere
  e.stopPropagation()

  if (commandMode.value) {
    handleCommandKey(e)
    return
  }

  // Escape cancels pending g or does nothing (but stays captured)
  if (e.key === 'Escape') {
    e.preventDefault()
    pendingG = false
    return
  }

  // Colon enters command mode
  if (e.key === ':') {
    e.preventDefault()
    commandMode.value = true
    commandBuffer.value = ''
    return
  }

  if (mode.value === 'netrw') {
    handleNetrwKey(e)
  } else {
    handleFileKey(e)
  }
}

function handleCommandKey(e: KeyboardEvent) {
  e.preventDefault()
  if (e.key === 'Escape') {
    commandMode.value = false
    commandBuffer.value = ''
  } else if (e.key === 'Enter') {
    executeCommand()
  } else if (e.key === 'Backspace') {
    if (commandBuffer.value.length === 0) {
      commandMode.value = false
    } else {
      commandBuffer.value = commandBuffer.value.slice(0, -1)
    }
  } else if (e.key.length === 1) {
    commandBuffer.value += e.key
  }
}

function executeCommand() {
  const cmd = commandBuffer.value.trim()
  commandMode.value = false
  commandBuffer.value = ''

  if (cmd === 'q' || cmd === 'q!') {
    if (mode.value === 'file') {
      mode.value = 'netrw'
      // Set cursor to the file we were viewing
      const idx = directoryEntries.value.findIndex(e => e.path === currentFile.value)
      cursorLine.value = idx >= 0 ? idx : 0
    } else {
      emit('quit')
    }
  }
}

let pendingG = false

function handleNetrwKey(e: KeyboardEvent) {
  const maxIdx = directoryEntries.value.length - 1

  if (pendingG) {
    pendingG = false
    if (e.key === 'g') {
      e.preventDefault()
      cursorLine.value = 0
      scrollNetrwCursorIntoView()
      return
    }
  }

  switch (e.key) {
    case 'j':
    case 'ArrowDown':
      e.preventDefault()
      cursorLine.value = Math.min(cursorLine.value + 1, maxIdx)
      scrollNetrwCursorIntoView()
      break
    case 'k':
    case 'ArrowUp':
      e.preventDefault()
      cursorLine.value = Math.max(cursorLine.value - 1, 0)
      scrollNetrwCursorIntoView()
      break
    case 'Enter':
      e.preventDefault()
      openEntry()
      break
    case '-':
      e.preventDefault()
      goUpDir()
      break
    case 'G':
      e.preventDefault()
      cursorLine.value = maxIdx
      scrollNetrwCursorIntoView()
      break
    case 'g':
      e.preventDefault()
      pendingG = true
      break
  }
}

function handleFileKey(e: KeyboardEvent) {
  const scrollEl = fileEl.value
  if (!scrollEl) return
  const lineHeight = 20

  switch (e.key) {
    case 'j':
    case 'ArrowDown':
      e.preventDefault()
      scrollEl.scrollTop += lineHeight
      break
    case 'k':
    case 'ArrowUp':
      e.preventDefault()
      scrollEl.scrollTop -= lineHeight
      break
    case 'G':
      e.preventDefault()
      scrollEl.scrollTop = scrollEl.scrollHeight
      break
    case 'g':
      e.preventDefault()
      pendingG = true
      break
    case 'd':
      if (e.ctrlKey) {
        e.preventDefault()
        scrollEl.scrollTop += scrollEl.clientHeight / 2
      }
      break
    case 'u':
      if (e.ctrlKey) {
        e.preventDefault()
        scrollEl.scrollTop -= scrollEl.clientHeight / 2
      }
      break
    case '-':
      e.preventDefault()
      goUpDir()
      break
  }

  if (pendingG && e.key === 'g') {
    // Already set pendingG in the switch, handle on next keypress
  }
}

function scrollNetrwCursorIntoView() {
  nextTick(() => {
    const el = netrwEl.value
    if (!el) return
    // 3 header lines offset
    // Scroll container so cursor line is visible
    const headerHeight = 60 // approximate header height
    const lineHeight = 20
    const targetTop = headerHeight + cursorLine.value * lineHeight
    const containerHeight = el.clientHeight

    if (targetTop < el.scrollTop + headerHeight) {
      el.scrollTop = targetTop - headerHeight
    } else if (targetTop + lineHeight > el.scrollTop + containerHeight) {
      el.scrollTop = targetTop + lineHeight - containerHeight
    }
  })
}

// Handle pending g for file view
watch(() => pendingG, (val) => {
  if (!val) return
  const timeout = setTimeout(() => { pendingG = false }, 1000)
  return () => clearTimeout(timeout)
})

// --- Initial file opening ---
onMounted(async () => {
  container.value?.focus()

  if (props.initialFile) {
    // Find the file
    const normalizedInput = props.initialFile.replace(/^\//, '')
    if (files[normalizedInput]) {
      currentFile.value = normalizedInput
      mode.value = 'file'
      await renderFile(normalizedInput)
      // Set currentDir to the file's directory
      const parts = normalizedInput.split('/')
      parts.pop()
      currentDir.value = parts.join('/')
    }
  }
})
</script>

<style>
/* Shiki output styling */
.file-content pre {
  margin: 0;
  padding: 0.5rem 0;
  background: transparent !important;
  overflow-x: auto;
}

.file-content pre code {
  font-family: var(--ctp-font-mono);
  font-size: 13px;
  line-height: 1.5;
  counter-reset: line-number;
}

.file-content pre code .line {
  display: inline-block;
  width: 100%;
  padding: 0 0.5rem 0 0;
}

.file-content pre code .line::before {
  counter-increment: line-number;
  content: counter(line-number);
  display: inline-block;
  width: 3.5em;
  text-align: right;
  padding-right: 1em;
  color: var(--ctp-overlay0);
  user-select: none;
}

</style>

<template>
  <div class="flex flex-col h-full -m-4 font-mono text-[12px]">
    <!-- Terminal header -->
    <div class="flex items-center gap-2 px-3 py-1.5 bg-[var(--ctp-crust)] border-b border-[var(--ctp-surface0)]">
      <span class="text-[var(--ctp-green)]">~</span>
      <span class="text-[var(--ctp-overlay0)]">zsh</span>
    </div>
    <!-- Terminal body -->
    <div
      ref="termBody"
      class="flex-1 overflow-y-auto p-3 bg-[var(--ctp-crust)]"
      @click="focusInput"
    >
      <div v-for="(line, i) in lines" :key="i">
        <div v-if="line.type === 'prompt'" class="flex gap-1">
          <span class="text-[var(--ctp-green)]">{{ user }}@{{ host }}</span>
          <span class="text-[var(--ctp-blue)]">{{ line.cwd }}</span>
          <span class="text-[var(--ctp-mauve)]">$</span>
          <span class="text-[var(--ctp-text)]">{{ line.cmd }}</span>
        </div>
        <div v-else class="text-[var(--ctp-subtext0)] whitespace-pre">{{ line.text }}</div>
      </div>
      <!-- Active prompt -->
      <div class="flex gap-1">
        <span class="text-[var(--ctp-green)]">{{ user }}@{{ host }}</span>
        <span class="text-[var(--ctp-blue)]">{{ cwd }}</span>
        <span class="text-[var(--ctp-mauve)]">$</span>
        <span class="relative">
          <input
            ref="inputEl"
            v-model="currentInput"
            class="bg-transparent text-[var(--ctp-text)] outline-none border-none w-64 caret-[var(--ctp-mauve)]"
            spellcheck="false"
            @keydown.enter="executeCommand"
          />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'

const user = 'guest'
const host = 'gestalt'
const cwd = ref('~')

interface PromptLine {
  type: 'prompt'
  cwd: string
  cmd: string
}

interface OutputLine {
  type: 'output'
  text: string
}

type Line = PromptLine | OutputLine

const lines = ref<Line[]>([])
const currentInput = ref('')
const inputEl = ref<HTMLInputElement | null>(null)
const termBody = ref<HTMLElement | null>(null)

const commands: Record<string, () => string> = {
  pwd: () => '/home/guest',
  ls: () => 'Documents  Downloads  Desktop  .config  .bashrc',
  whoami: () => user,
  hostname: () => host,
  date: () => new Date().toLocaleString(),
  uname: () => 'Linux gestalt 6.18.7-arch1-1 x86_64 GNU/Linux',
  uptime: () => ' ' + new Date().toLocaleTimeString() + ' up 42 days, 3:14, 1 user, load average: 0.42, 0.38, 0.35',
  clear: () => '__CLEAR__',
  help: () => 'Available commands: pwd, ls, whoami, hostname, date, uname, uptime, clear, help, neofetch',
  neofetch: () => `       /\\        ${user}@${host}
      /  \\       -----------
     /\\   \\      OS: Gestalt Linux x86_64
    /      \\     Kernel: 6.18.7-arch1-1
   /   ,,   \\    Shell: zsh 5.9
  /   |  |  -\\   Theme: Catppuccin Mocha
 /_-''    ''-_\\  Terminal: gestalt-term`,
}

function executeCommand() {
  const cmd = currentInput.value.trim()
  lines.value.push({ type: 'prompt', cwd: cwd.value, cmd })

  if (cmd === '') {
    // empty
  } else if (cmd === 'clear') {
    lines.value = []
  } else if (commands[cmd]) {
    const output = commands[cmd]()
    if (output !== '__CLEAR__') {
      lines.value.push({ type: 'output', text: output })
    }
  } else {
    lines.value.push({ type: 'output', text: `zsh: command not found: ${cmd}` })
  }

  currentInput.value = ''
  nextTick(() => {
    termBody.value?.scrollTo(0, termBody.value.scrollHeight)
  })
}

function focusInput() {
  inputEl.value?.focus()
}

onMounted(() => {
  inputEl.value?.focus()
})
</script>

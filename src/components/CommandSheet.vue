<template>
  <div class="text-[13px]" style="font-family: var(--ctp-font-mono);">
    <div class="mb-5">
      <h2 class="text-base font-bold text-[var(--ctp-lavender)] mb-2">Command Reference</h2>
      <p class="text-[var(--ctp-overlay1)] mb-3">Click a command to copy it to clipboard.</p>
    </div>

    <div v-for="group in commandGroups" :key="group.name" class="mb-5">
      <h3 class="text-xs font-semibold text-[var(--ctp-blue)] uppercase tracking-wider mb-2">{{ group.name }}</h3>
      <div class="flex flex-col gap-1">
        <div
          v-for="cmd in group.commands"
          :key="cmd.command"
          class="flex items-start gap-3 px-3.5 py-2.5 rounded-none hover:bg-[var(--ctp-surface0)]/50 cursor-pointer transition-colors group"
          @click="copyCommand(cmd.command)"
        >
          <code class="text-[var(--ctp-peach)] shrink-0 min-w-[120px]">{{ cmd.command }}</code>
          <span class="text-[var(--ctp-overlay1)]">{{ cmd.description }}</span>
          <span
            v-if="copiedCmd === cmd.command"
            class="ml-auto text-[var(--ctp-peach)] text-[10px] shrink-0"
          >copied!</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const copiedCmd = ref('')

const commandGroups = [
  {
    name: 'Navigation',
    commands: [
      { command: 'pwd', description: 'Print current working directory' },
      { command: 'ls', description: 'List directory contents' },
      { command: 'ls -la', description: 'List all files with details' },
      { command: 'cd <dir>', description: 'Change directory' },
    ],
  },
  {
    name: 'File Operations',
    commands: [
      { command: 'cat <file>', description: 'Display file contents' },
      { command: 'touch <file>', description: 'Create empty file' },
      { command: 'mkdir <dir>', description: 'Create directory' },
      { command: 'rm <file>', description: 'Remove file' },
      { command: 'cp <src> <dst>', description: 'Copy file' },
      { command: 'mv <src> <dst>', description: 'Move or rename file' },
    ],
  },
  {
    name: 'System',
    commands: [
      { command: 'whoami', description: 'Print current user' },
      { command: 'uname -a', description: 'Print system information' },
      { command: 'date', description: 'Print current date and time' },
      { command: 'uptime', description: 'Show system uptime' },
      { command: 'hostname', description: 'Print machine hostname' },
      { command: 'clear', description: 'Clear terminal screen' },
      { command: 'neofetch', description: 'Display system info with ASCII art' },
      { command: 'htop', description: 'Show CPU/memory usage and processes' },
    ],
  },
]

function copyCommand(cmd: string) {
  navigator.clipboard.writeText(cmd)
  copiedCmd.value = cmd
  setTimeout(() => {
    copiedCmd.value = ''
  }, 1500)
}
</script>

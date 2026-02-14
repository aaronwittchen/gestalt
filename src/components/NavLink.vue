<template>
  <a
    :href="href"
    class="flex items-center gap-1.5 rounded-none px-3 py-1.5 text-xs font-medium text-[var(--ctp-subtext0)] hover:text-[var(--ctp-text)] hover:bg-[var(--ctp-surface0)]/50 transition-colors"
  >
    <component :is="iconComponent" :size="14" />
    <span>{{ name }}</span>
  </a>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { BookOpen, SquareTerminal, NotebookPen, CreditCard, Users } from 'lucide-vue-next'

const props = defineProps<{
  name: string
  href: string
}>()

const iconMap: Record<string, Component> = {
  'Docs': BookOpen,
  'Scripts': SquareTerminal,
  'Blog': NotebookPen,
  'Pricing': CreditCard,
  'Community': Users,
}

const iconComponent = computed(() => iconMap[props.name] || BookOpen)
</script>

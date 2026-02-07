<template>
  <a
    :href="href"
    class="flex items-center gap-1.5 rounded px-2.5 py-1 text-[10px] font-medium text-[var(--ctp-subtext0)] hover:text-[var(--ctp-text)] hover:bg-[var(--ctp-surface0)] transition-colors"
  >
    <component :is="iconComponent" :size="12" />
    <span>{{ name }}</span>
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BookOpen, SquareTerminal, NotebookPen, CreditCard, Users } from 'lucide-vue-next'

const props = defineProps<{
  name: string
  href: string
}>()

const iconMap: Record<string, any> = {
  'Docs': BookOpen,
  'Scripts': SquareTerminal,
  'Blog': NotebookPen,
  'Pricing': CreditCard,
  'Community': Users,
}

const iconComponent = computed(() => iconMap[props.name] || BookOpen)
</script>

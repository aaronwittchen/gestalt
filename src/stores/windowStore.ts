import { reactive } from 'vue'

export interface WindowEntry {
  id: string
  title: string
  minimized: boolean
  restore: () => void
  focus: () => void
}

export const windowStore = reactive<{ windows: Map<string, WindowEntry> }>({
  windows: new Map(),
})

export function registerWindow(entry: WindowEntry) {
  windowStore.windows.set(entry.id, entry)
}

export function unregisterWindow(id: string) {
  windowStore.windows.delete(id)
}

export function minimizeWindow(id: string) {
  const win = windowStore.windows.get(id)
  if (win) win.minimized = true
}

export function restoreWindow(id: string) {
  const win = windowStore.windows.get(id)
  if (win) {
    win.minimized = false
    win.restore()
  }
}

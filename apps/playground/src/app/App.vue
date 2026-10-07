<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NotebookPen, Settings2, BookOpen, WifiOff } from '@lucide/vue'
import { AppShell, AppNavigation, UiButton, UiBadge } from '@starter/ui'
import type { NotesService } from '../features/notes'
import { usePwa } from '../platform/pwa/usePwa'
import { useTheme } from './useTheme'
defineProps<{ notes: NotesService }>()
const route = useRoute()
const router = useRouter()
const busy = ref(false)
const theme = useTheme()
const pwa = usePwa(busy)
const items = [
  { id: 'notes', label: 'Notes', icon: NotebookPen },
  { id: 'settings', label: 'Settings', icon: Settings2 },
]
const active = computed(() => String(route.name ?? 'notes'))
function navigate(id: string) {
  if (route.name === id) {
    window.scrollTo({ top: 0, behavior: 'instant' })
    return
  }
  void router.push({ name: id })
}
</script>
<template>
  <AppShell>
    <template #header
      ><div class="brand-header">
        <a
          :href="router.resolve({ name: 'notes' }).href"
          class="brand"
          @click.prevent="navigate('notes')"
          ><span class="brand-mark"
            ><BookOpen :size="21" aria-hidden="true" /></span
          >fieldnotes<span class="brand-dot">.</span></a
        >
        <div class="connection-status">
          <UiBadge v-if="!pwa.online.value" tone="warning"
            ><WifiOff :size="12" aria-hidden="true" />Offline</UiBadge
          ><UiBadge v-else-if="pwa.offlineReady.value" tone="success"
            ><span class="status-dot" />Offline ready</UiBadge
          ><span v-else class="muted">Your own little corner.</span>
        </div>
      </div></template
    >
    <template #navigation
      ><AppNavigation
        :items="items"
        :model-value="active"
        @update:model-value="navigate"
    /></template>
    <RouterView v-slot="{ Component }"
      ><component
        :is="Component"
        :service="notes"
        :theme="theme"
        :pwa="pwa"
        @busy-change="busy = $event"
        @update:theme="theme = $event"
    /></RouterView>
    <footer class="page-footer">
      <span>A little space for what matters.</span
      ><span>Yours. On this device.</span>
    </footer>
    <aside
      v-if="pwa.updateAvailable.value && !pwa.deferred.value"
      class="update-notice"
      aria-label="App update"
    >
      <div>
        <strong>A fresh version is ready.</strong>
        <p>
          {{
            busy
              ? 'Save or discard your draft before updating.'
              : 'Update when you are ready. Your saved notes stay here.'
          }}
        </p>
      </div>
      <div class="update-actions">
        <UiButton
          variant="ghost"
          :disabled="pwa.updating.value"
          @click="pwa.deferred.value = true"
          >Later</UiButton
        ><UiButton
          :disabled="busy"
          :loading="pwa.updating.value"
          @click="pwa.update"
          >Update now</UiButton
        >
      </div>
    </aside>
  </AppShell>
</template>

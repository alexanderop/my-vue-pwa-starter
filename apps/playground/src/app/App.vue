<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTranslation } from '../i18n'
import { NotebookPen, Settings2, BookOpen, WifiOff } from '@lucide/vue'
import { AppShell, AppNavigation, UiButton, UiBadge } from '@starter/ui'
import type { NotesService } from '../features/notes'
import { settingsPropsFor, type SettingsContext } from '../features/settings'
import { usePwa } from '../platform/pwa/usePwa'
import { useLanguage } from './useLanguage'
import { useTheme } from './useTheme'
const { notes } = defineProps<{ notes: NotesService }>()
const route = useRoute()
const router = useRouter()
const busy = ref(false)
const { theme, setTheme, accent, setAccent } = useTheme()
const { language, setLanguage } = useLanguage()
const { t } = useTranslation()
const pwa = usePwa(busy)
const items = computed(() => [
  { id: 'notes', label: t('app.nav.notes'), icon: NotebookPen },
  { id: 'settings', label: t('app.nav.settings'), icon: Settings2 },
])
function onBusyChange(value: boolean) {
  busy.value = value
}
const settingsContext = computed<SettingsContext>(() => ({
  service: notes,
  theme: theme.value,
  setTheme,
  accent: accent.value,
  setAccent,
  language: language.value,
  setLanguage,
  pwa,
  onBusyChange,
}))
// An item is active when its destination lives in the current top-level route.
const active = computed(
  () =>
    items.value.find(
      ({ id }) => router.resolve({ name: id }).matched[0] === route.matched[0],
    )?.id ?? 'notes',
)
// Each route receives only the props its page declares.
const pageProps = computed(
  () =>
    settingsPropsFor(route.name, settingsContext.value) ?? {
      service: notes,
      onBusyChange,
    },
)
function navigate(id: string) {
  if (route.name === id) {
    window.scrollTo({ top: 0, behavior: 'instant' })
    return
  }
  void router.push({ name: id })
}
</script>
<template>
  <AppShell :skip-label="t('app.skipToContent')">
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
            ><WifiOff :size="12" aria-hidden="true" />{{
              t('app.offline')
            }}</UiBadge
          ><UiBadge v-else-if="pwa.offlineReady.value" tone="success"
            ><span class="status-dot" />{{ t('app.offlineReady') }}</UiBadge
          ><span v-else class="muted">{{ t('app.tagline') }}</span>
        </div>
      </div></template
    >
    <template #navigation
      ><AppNavigation
        :items="items"
        :label="t('app.mainNavigation')"
        :model-value="active"
        @update:model-value="navigate"
    /></template>
    <RouterView v-slot="{ Component }"
      ><component :is="Component" v-bind="pageProps"
    /></RouterView>
    <footer class="page-footer">
      <span>{{ t('app.footer.purpose') }}</span
      ><span>{{ t('app.footer.ownership') }}</span>
    </footer>
    <aside
      v-if="pwa.updateAvailable.value && !pwa.deferred.value"
      class="update-notice"
      :aria-label="t('app.update.label')"
    >
      <div>
        <strong>{{ t('app.update.title') }}</strong>
        <p>{{ busy ? t('app.update.busy') : t('app.update.idle') }}</p>
      </div>
      <div class="update-actions">
        <UiButton
          variant="ghost"
          :disabled="pwa.updating.value"
          @click="pwa.deferred.value = true"
          >{{ t('app.update.later') }}</UiButton
        ><UiButton
          :disabled="busy"
          :loading="pwa.updating.value"
          @click="pwa.update"
          >{{ t('app.update.now') }}</UiButton
        >
      </div>
    </aside>
  </AppShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from '../../../i18n'
import { Check, Info, RefreshCw, Wifi } from '@lucide/vue'
import { UiButton } from '@starter/ui'
import type { AppCapabilities } from '../ports/settings'
import { appVersion } from './appVersion'
import SettingsGroup from './SettingsGroup.vue'
import SettingsRow from './SettingsRow.vue'
import SettingsScreen from './SettingsScreen.vue'

const { pwa } = defineProps<{ pwa: AppCapabilities }>()
const { t } = useTranslation()
const title = computed(() => {
  if (pwa.checking.value) return t('settings.updates.checking')
  if (pwa.updateAvailable.value) return t('settings.updates.ready')
  return t('settings.updates.current')
})
const status = computed(() =>
  pwa.status.value ? t(`settings.updates.status.${pwa.status.value}`) : '',
)
</script>
<template>
  <SettingsScreen :title="t('settings.updates.title')">
    <div class="status-card">
      <span class="badge" :class="{ checking: pwa.checking.value }">
        <RefreshCw v-if="pwa.checking.value" :size="30" aria-hidden="true" />
        <Check v-else :size="30" stroke-width="2.6" aria-hidden="true" />
      </span>
      <h2>{{ title }}</h2>
      <p role="status">{{ status }}</p>
    </div>

    <SettingsGroup>
      <SettingsRow
        :icon="Wifi"
        :tone="pwa.offlineReady.value ? 'success' : 'muted'"
        :label="t('settings.updates.offlineUse')"
        :description="
          pwa.offlineReady.value
            ? t('settings.updates.offlineSaved')
            : t('settings.updates.offlinePending')
        "
        :value="
          pwa.offlineReady.value
            ? t('app.offlineReady')
            : t('settings.preparing')
        "
      />
      <SettingsRow
        :icon="Info"
        :label="t('settings.updates.version', { version: appVersion() })"
      />
    </SettingsGroup>

    <UiButton
      variant="secondary"
      class="check"
      :loading="pwa.checking.value"
      @click="pwa.checkForUpdates"
      ><RefreshCw :size="16" aria-hidden="true" />{{
        t('settings.updates.check')
      }}</UiButton
    >
    <p class="help">{{ t('settings.updates.help') }}</p>
  </SettingsScreen>
</template>

<style scoped>
.status-card {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 28px 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  box-shadow: var(--shadow);
  text-align: center;
}
.badge {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-success-soft);
  color: var(--color-success);
}
.badge.checking {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}
.badge.checking svg {
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
h2 {
  margin: 4px 0 0;
  font-size: 22px;
  font-weight: 650;
  letter-spacing: -0.4px;
}
.status-card p {
  margin: 0;
  font-size: 14px;
  color: var(--color-muted);
}
.check {
  min-height: 52px;
}
.help {
  margin: -8px 4px 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-muted);
}
</style>

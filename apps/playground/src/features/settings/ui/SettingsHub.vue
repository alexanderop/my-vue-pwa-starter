<script setup lang="ts">
import { BookOpen, ShieldCheck } from '@lucide/vue'
import { useTranslation } from '../../../i18n'
import { UiBadge } from '@starter/ui'
import type { Accent, Theme } from '../domain/appearance'
import type { Language } from '../domain/language'
import type { AppCapabilities } from '../ports/settings'
import { routeNameFor, sectionTitle, settingsGroups } from './sections'
import SettingsGroup from './SettingsGroup.vue'
import SettingsRow from './SettingsRow.vue'

const { theme, accent, language, pwa } = defineProps<{
  theme: Theme
  accent: Accent
  language: Language
  pwa: AppCapabilities
}>()
const { t } = useTranslation()
</script>
<template>
  <section class="hub">
    <h1>{{ t('settings.title') }}</h1>

    <div class="app-card">
      <span class="mark"><BookOpen :size="28" aria-hidden="true" /></span>
      <div class="identity">
        <strong>fieldnotes<span class="dot">.</span></strong>
        <span>{{ t('app.tagline') }}</span>
      </div>
      <UiBadge :tone="pwa.offlineReady.value ? 'success' : 'neutral'">{{
        pwa.offlineReady.value ? t('app.offlineReady') : t('settings.preparing')
      }}</UiBadge>
    </div>

    <SettingsGroup
      v-for="group in settingsGroups"
      :key="group.id"
      :label="group.label && t(group.label)"
    >
      <SettingsRow
        v-for="section in group.sections"
        :key="section.id"
        :to="{ name: routeNameFor(section) }"
        :icon="section.icon"
        :tone="section.tone"
        :label="t(sectionTitle(section))"
        :value="section.value?.({ theme, accent, language, pwa }, t)"
      />
    </SettingsGroup>

    <p class="privacy">
      <ShieldCheck :size="16" aria-hidden="true" />
      <span>{{ t('settings.privacy') }}</span>
    </p>
  </section>
</template>

<style scoped>
.hub {
  display: grid;
  gap: 22px;
  width: min(560px, calc(100% - 40px));
  margin: 0 auto;
  padding: 14px 0 35px;
}
h1 {
  max-width: none;
  margin: 0 4px;
  font-size: 32px;
  letter-spacing: -1px;
}
.app-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  box-shadow: var(--shadow);
}
.mark {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius);
  background: var(--color-primary);
  color: var(--color-surface);
}
.identity {
  display: grid;
  flex: 1;
  gap: 3px;
  min-width: 0;
  font-size: 14px;
  color: var(--color-muted);
}
.identity strong {
  font-size: 18px;
  font-weight: 650;
  letter-spacing: -0.4px;
  color: var(--color-foreground);
}
.dot {
  color: var(--color-primary);
}
.privacy {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0;
  padding: 0 4px;
  color: var(--color-muted);
  font-size: 13px;
  line-height: 1.5;
}
.privacy svg {
  flex-shrink: 0;
  margin-top: 2px;
}
</style>

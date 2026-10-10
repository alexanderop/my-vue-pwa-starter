<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from '../../../i18n'
import { languages, type Language } from '../domain/language'
import { languageLabel } from './languageLabel'
import type { SaveChoice } from './settingsContext'
import SegmentedControl from './SegmentedControl.vue'
import SettingsScreen from './SettingsScreen.vue'
import { useSaveStatus } from './useSaveStatus'

const { language, setLanguage } = defineProps<{
  language: Language
  setLanguage: SaveChoice<Language>
}>()
const { t } = useTranslation()
const options = computed(() =>
  languages.map((id) => ({ id, label: languageLabel(id, t) })),
)
const { message, report } = useSaveStatus()
</script>
<template>
  <SettingsScreen :title="t('settings.language.title')">
    <SegmentedControl
      :legend="t('settings.language.legend')"
      name="language"
      :options="options"
      :model-value="language"
      @update:model-value="report(setLanguage($event))"
    />
    <p class="help">{{ t('settings.language.help') }}</p>
    <p role="status" class="help" data-testid="language-status">
      {{ message }}
    </p>
  </SettingsScreen>
</template>

<style scoped>
.help {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-muted);
}
</style>

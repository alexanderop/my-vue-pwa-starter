<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useTranslation } from '../../../i18n'
import { Check, Monitor, Moon, Plus, Sun } from '@lucide/vue'
import { accents, themes, type Accent, type Theme } from '../domain/appearance'
import { appearanceSummary } from './appearanceSummary'
import type { SaveChoice } from './settingsContext'
import SegmentedControl from './SegmentedControl.vue'
import SettingsScreen from './SettingsScreen.vue'
import { useSaveStatus } from './useSaveStatus'

const { theme, setTheme, accent, setAccent } = defineProps<{
  theme: Theme
  setTheme: SaveChoice<Theme>
  accent: Accent
  setAccent: SaveChoice<Accent>
}>()
const { t } = useTranslation()

const themeIcons: Record<Theme, Component> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
}
const themeOptions = computed(() =>
  themes.map((id) => ({
    id,
    label: t(`settings.appearance.themes.${id}`),
    icon: themeIcons[id],
  })),
)
const summary = computed(() => appearanceSummary(theme, accent, t))
const { message, report } = useSaveStatus()
</script>
<template>
  <SettingsScreen :title="t('settings.appearance.title')">
    <div class="preview" aria-hidden="true">
      <div class="preview-top">
        <span class="preview-label">{{
          t('settings.appearance.preview')
        }}</span>
        <span>{{ summary }}</span>
      </div>
      <div class="sample">
        <div class="sample-top">
          <span>{{ t('settings.appearance.sampleLabel') }}</span>
          <span>08:12</span>
        </div>
        <h3>{{ t('settings.appearance.sampleTitle') }}</h3>
        <p>{{ t('settings.appearance.sampleBody') }}</p>
      </div>
      <span class="pill"><Plus :size="16" />{{ t('notes.newNote') }}</span>
    </div>

    <section class="section">
      <h2>{{ t('settings.appearance.mode') }}</h2>
      <SegmentedControl
        :legend="t('settings.appearance.mode')"
        name="theme"
        :options="themeOptions"
        :model-value="theme"
        @update:model-value="report(setTheme($event))"
      />
    </section>

    <section class="section">
      <h2>{{ t('settings.appearance.accent') }}</h2>
      <fieldset class="accents">
        <legend class="sr-only">{{ t('settings.appearance.accent') }}</legend>
        <label v-for="id in accents" :key="id">
          <input
            type="radio"
            name="accent"
            :value="id"
            :checked="accent === id"
            @change="report(setAccent(id))"
          />
          <span class="swatch"
            ><span class="dot" :data-accent="id"
              ><Check :size="20" stroke-width="3" aria-hidden="true" /></span
          ></span>
          <span class="name">{{ t(`settings.appearance.accents.${id}`) }}</span>
        </label>
      </fieldset>
      <p class="help">{{ t('settings.appearance.help') }}</p>
      <p role="status" class="help" data-testid="theme-status">
        {{ message }}
      </p>
    </section>
  </SettingsScreen>
</template>

<style scoped>
.preview {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-primary-soft);
}
.preview-top,
.sample-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-muted);
}
.preview-label {
  font-family: var(--font-mono);
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--color-primary);
}
.sample {
  padding: 14px 16px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
}
.sample-top {
  font-family: var(--font-mono);
  letter-spacing: 0.6px;
  text-transform: uppercase;
}
.sample h3 {
  margin: 12px 0 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-primary);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.2px;
}
.sample p {
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 24px;
  color: var(--color-body);
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0 23px,
    var(--color-rule) 23px 24px
  );
}
.pill {
  display: inline-flex;
  align-items: center;
  justify-self: end;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 999px;
  background: var(--color-primary);
  color: var(--color-surface);
  font-size: 14px;
  font-weight: 600;
}
.section {
  display: grid;
  gap: 10px;
}
.section h2 {
  margin: 0;
  padding: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--color-muted);
}
.accents {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 4px;
  min-width: 0;
  margin: 0;
  padding: 12px 4px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
}
label {
  position: relative;
  display: grid;
  justify-items: center;
  align-content: start;
  gap: 6px;
  min-height: 44px;
  color: var(--color-muted);
  font-size: 13px;
}
label:has(input:checked) {
  color: var(--color-foreground);
  font-weight: 600;
}
label:has(input:focus-visible) {
  outline: 3px solid color-mix(in srgb, var(--color-primary) 65%, transparent);
  outline-offset: 2px;
  border-radius: var(--radius);
}
input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}
.swatch {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border: 2px solid transparent;
  border-radius: 50%;
}
label:has(input:checked) .swatch {
  border-color: var(--color-primary);
}
.dot {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-surface);
}
.dot svg {
  visibility: hidden;
}
label:has(input:checked) .dot svg {
  visibility: visible;
}
.help {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-muted);
}
</style>

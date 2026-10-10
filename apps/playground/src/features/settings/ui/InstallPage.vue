<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTranslation } from '../../../i18n'
import { BookOpen } from '@lucide/vue'
import { UiButton } from '@starter/ui'
import type { AppCapabilities } from '../ports/settings'
import SegmentedControl from './SegmentedControl.vue'
import SettingsScreen from './SettingsScreen.vue'

defineProps<{ pwa: AppCapabilities }>()

type Platform = 'ios' | 'android' | 'desktop'
const platformIds = [
  'ios',
  'android',
  'desktop',
] as const satisfies readonly Platform[]
const { t, list } = useTranslation()
const platforms = computed(() =>
  platformIds.map((id) => ({
    id,
    label: t(`settings.install.platforms.${id}`),
  })),
)

function detectPlatform(): Platform {
  const touchMac =
    navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) || touchMac) return 'ios'
  if (/Android/.test(navigator.userAgent)) return 'android'
  return 'desktop'
}
const platform = ref(detectPlatform())
const steps = computed(() => list(`settings.install.steps.${platform.value}`))
</script>
<template>
  <SettingsScreen :title="t('settings.install.title')">
    <div class="hero">
      <span class="icon"><BookOpen :size="38" aria-hidden="true" /></span>
      <h2>{{ t('settings.install.heading') }}</h2>
      <p>{{ t('settings.install.intro') }}</p>
      <span class="pill" :class="{ installed: pwa.installed.value }">{{
        pwa.installed.value
          ? t('settings.install.installedHere')
          : t('settings.install.notInstalledHere')
      }}</span>
    </div>

    <template v-if="!pwa.installed.value">
      <UiButton
        v-if="pwa.canInstall.value"
        class="install"
        @click="pwa.install"
        >{{ t('settings.install.action') }}</UiButton
      >
      <template v-else>
        <SegmentedControl
          v-model="platform"
          :legend="t('settings.install.device')"
          name="platform"
          :options="platforms"
        />
        <ol class="steps">
          <li v-for="(step, index) in steps" :key="step">
            <span class="number" aria-hidden="true">{{ index + 1 }}</span
            ><span class="step">{{ step }}</span>
          </li>
        </ol>
        <p class="help">{{ t('settings.install.fallback') }}</p>
      </template>
    </template>
  </SettingsScreen>
</template>

<style scoped>
.hero {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 8px 12px 0;
  text-align: center;
}
.icon {
  display: grid;
  place-items: center;
  width: 76px;
  height: 76px;
  border-radius: 16px;
  background: var(--color-primary);
  color: var(--color-surface);
  box-shadow: 0 8px 24px #1b1d2124;
}
h2 {
  margin: 6px 0 0;
  font-size: 24px;
  font-weight: 650;
  letter-spacing: -0.5px;
}
.hero p {
  max-width: 340px;
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: var(--color-body);
}
.pill {
  padding: 4px 10px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 600;
}
.pill.installed {
  border-color: transparent;
  background: var(--color-success-soft);
  color: var(--color-success);
}
.install {
  min-height: 52px;
}
.steps {
  display: grid;
  margin: 0;
  padding: 4px 16px;
  list-style: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
}
.steps li {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 0;
}
.steps li + li {
  border-top: 1px solid var(--color-rule);
}
.number {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 700;
}
.step {
  padding-top: 3px;
  font-size: 15px;
  line-height: 1.5;
}
.help {
  margin: 0 4px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-muted);
}
</style>

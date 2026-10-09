<script setup lang="ts">
import { computed, ref } from 'vue'
import { BookOpen } from '@lucide/vue'
import { UiButton } from '@starter/ui'
import type { AppCapabilities } from '../ports/settings'
import SegmentedControl from './SegmentedControl.vue'
import SettingsScreen from './SettingsScreen.vue'

defineProps<{ pwa: AppCapabilities }>()

type Platform = 'ios' | 'android' | 'desktop'

const platforms = [
  {
    id: 'ios',
    label: 'iPhone',
    steps: [
      'Open this page in Safari.',
      'Tap Share, then Add to Home Screen. You may need to scroll through the actions.',
      'Tap Add, then open Fieldnotes from your Home Screen.',
    ],
  },
  {
    id: 'android',
    label: 'Android',
    steps: [
      'Open this page in Chrome.',
      'Open the browser menu and choose Install app or Add to Home screen.',
      'Follow the browser instructions. The wording can vary by device.',
    ],
  },
  {
    id: 'desktop',
    label: 'Computer',
    steps: [
      'In Chrome or Edge, look for the install icon in the address bar or Install in the browser menu.',
      'In Safari on a supported Mac, choose File → Add to Dock.',
    ],
  },
] as const satisfies readonly {
  id: Platform
  label: string
  steps: readonly string[]
}[]

function detectPlatform(): Platform {
  const touchMac =
    navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) || touchMac) return 'ios'
  if (/Android/.test(navigator.userAgent)) return 'android'
  return 'desktop'
}
const platform = ref(detectPlatform())
const steps = computed(
  () => platforms.find((option) => option.id === platform.value)?.steps ?? [],
)
</script>
<template>
  <SettingsScreen title="Add to Home Screen">
    <div class="hero">
      <span class="icon"><BookOpen :size="38" aria-hidden="true" /></span>
      <h2>Keep Fieldnotes close</h2>
      <p>
        Open it from your Home Screen like any other app. It works without a
        connection.
      </p>
      <span class="pill" :class="{ installed: pwa.installed.value }">{{
        pwa.installed.value
          ? 'Installed on this device'
          : 'Not installed on this device'
      }}</span>
    </div>

    <template v-if="!pwa.installed.value">
      <UiButton v-if="pwa.canInstall.value" class="install" @click="pwa.install"
        >Install Fieldnotes</UiButton
      >
      <template v-else>
        <SegmentedControl
          v-model="platform"
          legend="Your device"
          name="platform"
          :options="platforms"
        />
        <ol class="steps">
          <li v-for="(step, index) in steps" :key="step">
            <span class="number" aria-hidden="true">{{ index + 1 }}</span
            ><span class="step">{{ step }}</span>
          </li>
        </ol>
        <p class="help">
          If your browser offers no installation option, you can still use
          Fieldnotes in a tab.
        </p>
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

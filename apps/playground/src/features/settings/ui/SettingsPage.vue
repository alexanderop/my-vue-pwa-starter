<script setup lang="ts">
import {
  Download,
  Monitor,
  Moon,
  Sun,
  RefreshCw,
  ShieldCheck,
} from '@lucide/vue'
import { UiButton, UiCard, UiBadge } from '@starter/ui'
import type { Theme, AppCapabilities } from '../ports/settings'
defineProps<{ theme: Theme; pwa: AppCapabilities }>()
const emit = defineEmits<{ 'update:theme': [theme: Theme] }>()
const version = __APP_VERSION__
const themes = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const
</script>
<template>
  <section class="page settings-page" aria-labelledby="settings-title">
    <div class="page-heading">
      <div>
        <p class="eyebrow">MAKE YOURSELF AT HOME</p>
        <h1 id="settings-title">A little more you.</h1>
        <p class="page-description">Your space, just the way you like it.</p>
      </div>
    </div>
    <UiCard class="settings-card"
      ><h2>Appearance</h2>
      <p class="muted">Choose a theme that feels right.</p>
      <fieldset class="theme-picker">
        <legend class="sr-only">Theme</legend>
        <label
          v-for="item in themes"
          :key="item.value"
          :class="{ selected: theme === item.value }"
          ><input
            type="radio"
            name="theme"
            :value="item.value"
            :checked="theme === item.value"
            @change="emit('update:theme', item.value)"
          /><component :is="item.icon" :size="22" aria-hidden="true" /><span>{{
            item.label
          }}</span></label
        >
      </fieldset></UiCard
    >
    <UiCard class="settings-card"
      ><div class="settings-row">
        <div>
          <h2>Always close by</h2>
          <p class="muted">Give your thoughts a home on your device.</p>
        </div>
        <Download :size="22" aria-hidden="true" />
      </div>
      <p v-if="pwa.installed.value">Fieldnotes is installed on this device.</p>
      <UiButton v-else-if="pwa.canInstall.value" @click="pwa.install"
        >Install Fieldnotes</UiButton
      >
      <p v-else class="install-help">
        On iPhone or iPad, open in Safari, tap Share, then Add to Home Screen.
        On desktop or Android, look for Install app or Add to Home screen in
        your browser menu.
      </p></UiCard
    >
    <UiCard class="settings-card"
      ><div class="settings-row">
        <div>
          <h2>Ready when you are</h2>
          <p class="muted">
            {{
              pwa.offlineReady.value
                ? 'The app is saved for offline use.'
                : 'Open the production app online once to prepare offline use.'
            }}
          </p>
        </div>
        <UiBadge :tone="pwa.offlineReady.value ? 'success' : 'neutral'">{{
          pwa.offlineReady.value ? 'Offline ready' : 'Preparing'
        }}</UiBadge>
      </div>
      <div class="settings-row update-row">
        <span class="muted">Version {{ version }}</span
        ><UiButton
          variant="secondary"
          :loading="pwa.checking.value"
          @click="pwa.checkForUpdates"
          ><RefreshCw :size="16" aria-hidden="true" />Check for
          updates</UiButton
        >
      </div>
      <p v-if="pwa.status.value" role="status" class="muted">
        {{ pwa.status.value }}
      </p></UiCard
    >
    <div class="privacy-note">
      <ShieldCheck :size="19" aria-hidden="true" />
      <p>
        Your notes stay in this browser. No accounts, tracking, or cloud sync.
        Clearing browser data removes your notes.
      </p>
    </div>
  </section>
</template>
